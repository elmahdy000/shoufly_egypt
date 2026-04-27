import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { Notify } from '../notifications/hub';
import { getPaymentRedirectUrl } from '@/lib/payments/config';
import crypto from 'crypto';

function toTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Generate secure QR code with random token
 * Prevents guessing attacks by using cryptographically secure random bytes
 */
function generateSecureQRCode(requestId: number): string {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(16).toString('hex');
  return `REQ-${requestId}-${timestamp}-${randomBytes}`;
}

export async function payRequest(requestId: number, clientId: number) {
  logger.info('payment.request.started', { requestId, clientId });
  return prisma.$transaction(async (tx) => {
    const request = await tx.request.findUnique({
      where: { id: requestId },
      include: {
        client: true,
        bids: {
          where: { status: 'ACCEPTED_BY_CLIENT' },
          select: { id: true, clientPrice: true, vendorId: true, status: true },
        },
        deliveryTracking: {
          orderBy: { createdAt: 'asc' },
          select: { id: true, status: true },
        },
      },
    });

    if (!request) {
      logger.warn('payment.request.not_found', { requestId, clientId });
      throw new Error('معلش، الطلب ده مش موجود أو اتمسح خلاص.');
    }

    if (request.clientId !== clientId) {
      logger.warn('payment.request.unauthorized', { 
        requestId, 
        requestOwner: request.clientId, 
        attemptedPayer: clientId 
      });
      throw new Error('معلش، صاحب الطلب بس هو اللي يقدر يدفع.');
    }


    if (
      request.status === 'ORDER_PAID_PENDING_DELIVERY' ||
      request.status === 'CLOSED_SUCCESS'
    ) {
      const statusMap: Record<string, string> = {
        'ORDER_PAID_PENDING_DELIVERY': 'اتدفع ومستني التوصيل',
        'CLOSED_SUCCESS': 'خلص خلاص بنجاح'
      };
      throw new Error(`الطلب ده اتدفع تمنه فعلاً أو خلص (الحالة دلوقتي: ${statusMap[request.status] || request.status})`);
    }

    if (request.status !== 'OFFERS_FORWARDED') {
      const statusMap: Record<string, string> = {
        'PENDING_ADMIN_REVIEW': 'بيراجعه الإدارة',
        'OPEN_FOR_BIDDING': 'مفتوح للعروض',
        'BIDS_RECEIVED': 'جاله عروض',
      };
      throw new Error(`مينفعش تدفع دلوقتي، لازم تختار عرض الأول (الحالة دلوقتي: ${statusMap[request.status] || request.status})`);
    }

    if (!request.selectedBidId) {
      logger.warn('payment.request.no_selected_bid', { requestId, clientId });
      throw new Error('لا يوجد عرض سعر محدد لهذا الطلب حالياً.');
    }

    const selectedBid = request.bids.find((b) => b.id === request.selectedBidId);
    if (!selectedBid || selectedBid.status !== 'ACCEPTED_BY_CLIENT') {
      throw new Error('يجب قبول العرض من قبل العميل أولاً قبل محاولة السداد.');
    }

    // NEW: Fetch actual Payer details (might be different from Request owner)
    const payer = await tx.user.findUnique({
      where: { id: clientId },
      select: { id: true, walletBalance: true }
    });

    if (!payer) throw new Error('تعذر العثور على حساب الدافع، يرجى التأكد من تسجيل الدخول.');

    const amountToPay = toTwo(Number(selectedBid.clientPrice));
    
    // 🛡️ SECURITY: Validate positive amount
    if (amountToPay <= 0) {
      throw new Error('مبلغ الدفع يجب أن يكون أكبر من صفر.');
    }
    
    const currentWallet = toTwo(Number(payer.walletBalance));

    if (currentWallet < amountToPay) {
      logger.info('payment.request.insufficient_redirecting', { requestId, amountToPay });
      
      // In a real scenario, we create a specialized transaction for this request
      // Pass a pending session ID formatted properly for the payment gateway.
      // The actual transaction record will be created in the webhook upon successful payment confirmation.
      const pendingSessionId = `pending-${crypto.randomUUID()}`;

      return {
        insufficientBalance: true,
        redirectUrl: getPaymentRedirectUrl(
          pendingSessionId, 
          amountToPay, 
          String(request.id)
        ),
        message: 'رصيد المحفظة غير كافٍ. جاري تحويلك لخيارات الدفع الإلكتروني لسداد قيمة الأوردر...'
      };
    }

    // Atomic decrement with balance check - prevents race conditions
    const updatedClient = await tx.user.update({
      where: { 
        id: clientId,
        walletBalance: { gte: amountToPay } // Ensures sufficient balance at DB level
      },
      data: { walletBalance: { decrement: amountToPay } },
      select: { id: true, walletBalance: true },
    });
    
    if (!updatedClient) {
      throw new Error('عذراً، رصيد المحفظة غير كافٍ أو حدث خطأ أثناء التحديث، يرجى المحاولة مرة أخرى.');
    }

    await tx.transaction.create({
      data: {
        userId: clientId,
        requestId: request.id,
        amount: amountToPay,
        type: 'ESCROW_DEPOSIT',
        description: `Escrow deposit for request #${request.id}`,
      },
    });

    // SECURITY: Use secure QR code generation with random token
    const qrCode = request.qrCode || generateSecureQRCode(request.id);

    const updatedRequest = await tx.request.update({
      where: { id: request.id },
      data: {
        status: 'ORDER_PAID_PENDING_DELIVERY',
        qrCode,
      },
      select: {
        id: true,
        status: true,
        selectedBidId: true,
        qrCode: true,
      },
    });

    const hasOrderPlaced = request.deliveryTracking.some(
      (entry) => entry.status === 'ORDER_PLACED'
    );

    if (!hasOrderPlaced) {
      await tx.deliveryTracking.create({
        data: {
          requestId: request.id,
          status: 'ORDER_PLACED',
          note: 'Payment completed, order placed',
        },
      });
    }

    await Notify.send({
      userId: request.clientId,
      type: 'PAYMENT_RECEIVED',
      title: 'تم تأكيد الدفع! 💰',
      message: `تم سداد قيمة الطلب رقم #${request.id} بنجاح.`,
      requestId: request.id,
    }, tx);

    await Notify.send({
      userId: selectedBid.vendorId,
      type: 'PAYMENT_RECEIVED',
      title: 'تم سداد قيمة الطلب! 💸',
      message: `قام العميل بسداد قيمة الطلب رقم #${request.id}. يمكنك الآن البدء في التنفيذ.`,
      requestId: request.id,
    }, tx);

    logger.info('notification.created', {
      event: 'payment.completed',
      requestId: request.id,
      recipients: [request.clientId, selectedBid.vendorId],
    });

    logger.info('payment.request.completed', {
      requestId: updatedRequest.id,
      clientId,
      amountPaid: amountToPay,
      requestStatus: updatedRequest.status,
    });

    return {
      requestId: updatedRequest.id,
      selectedBidId: updatedRequest.selectedBidId,
      amountPaid: amountToPay,
      newWalletBalance: Number(updatedClient.walletBalance),
      requestStatus: updatedRequest.status,
      qrCode: updatedRequest.qrCode,
    };
  }, { timeout: 20000 });
}
