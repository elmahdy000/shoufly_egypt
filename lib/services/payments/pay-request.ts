import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

function toTwo(value: number): number {
  return Math.round(value * 100) / 100;
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
      throw new Error('Request not found');
    }

    if (request.clientId !== clientId) {
      logger.warn('payment.request.forbidden_owner', { requestId, clientId });
      throw new Error('Forbidden');
    }

    if (!request.selectedBidId) {
      logger.warn('payment.request.no_selected_bid', { requestId, clientId });
      throw new Error('Request has no selected bid');
    }

    if (
      request.status === 'ORDER_PAID_PENDING_DELIVERY' ||
      request.status === 'CLOSED_SUCCESS'
    ) {
      throw new Error(`Request is already paid or closed (${request.status})`);
    }

    const selectedBid = request.bids.find((b) => b.id === request.selectedBidId);
    if (!selectedBid || selectedBid.status !== 'ACCEPTED_BY_CLIENT') {
      throw new Error('Selected bid must be ACCEPTED_BY_CLIENT before payment');
    }

    const amountToPay = toTwo(Number(selectedBid.clientPrice));
    const currentWallet = toTwo(Number(request.client.walletBalance));

    if (currentWallet < amountToPay) {
      logger.info('payment.request.insufficient_redirecting', { requestId, amountToPay });
      
      // In a real scenario, we create a specialized transaction for this request
      const pendingTx = await tx.transaction.create({
        data: {
          userId: clientId,
          requestId: request.id,
          amount: amountToPay,
          type: 'WALLET_TOPUP', 
          description: `دفع مباشر للأوردر #${request.id} (انتظار التأكيد)`
        }
      });

      return {
        insufficientBalance: true,
        redirectUrl: `/payments/mock-gateway?txnId=${pendingTx.id}&amount=${amountToPay}&requestId=${request.id}`,
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
      throw new Error('Insufficient balance or concurrent modification detected');
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

    const qrCode = request.qrCode || `REQ-${request.id}-${Date.now()}`;

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

    await tx.notification.create({
      data: {
        userId: request.clientId,
        type: 'PAYMENT_RECEIVED',
        title: 'Payment Recorded',
        message: `Payment for request #${request.id} was recorded successfully.`,
      },
    });

    await tx.notification.create({
      data: {
        userId: selectedBid.vendorId,
        type: 'PAYMENT_RECEIVED',
        title: 'Order Paid',
        message: `Client payment was completed for request #${request.id}.`,
      },
    });

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
  });
}
