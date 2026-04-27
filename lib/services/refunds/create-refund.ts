import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { Notify } from '../notifications/hub';
import { d, toTwo } from '@/lib/utils/decimal';

export async function createRefund(params: {
  requestId: number;
  adminId: number;
  reason?: string;
}) {
  const { requestId, reason } = params;
  logger.info('refund.request.started', { requestId, reason: reason || null });

  return prisma.$transaction(async (tx) => {
    const request = await tx.request.findUnique({
      where: { id: requestId },
      include: {
        client: { select: { id: true, walletBalance: true } },
        transactions: {
          where: { type: { in: ['ESCROW_DEPOSIT', 'REFUND'] } },
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          select: { id: true, type: true, amount: true },
        },
        bids: {
          where: { status: 'ACCEPTED_BY_CLIENT' },
          select: { vendorId: true },
          take: 1,
        },
      },
    });

    if (!request) {
      logger.warn('refund.request.not_found', { requestId });
      throw new Error('تعذر العثور على الطلب المحدد لإصدار الاسترداد.');
    }

    if (request.status === 'CLOSED_SUCCESS') {
      throw new Error('لا يمكن رد الأموال لطلب تم إكماله وتسويته بنجاح بالفعل.');
    }

    // Check for existing refund at database level (race-condition safe)
    const existingRefund = await tx.transaction.findFirst({
      where: { requestId, type: 'REFUND' }
    });
    if (existingRefund) {
      logger.warn('refund.request.duplicate', { requestId, refundTxId: existingRefund.id });
      throw new Error(`تم إصدار استرداد أموال لهذا الطلب بالفعل (رقم العملية: ${existingRefund.id}).`);
    }

    const escrow = request.transactions.find((txr) => txr.type === 'ESCROW_DEPOSIT');
    if (!escrow) {
      logger.warn('refund.request.no_escrow', { requestId });
      throw new Error('لم يتم العثور على عملية دفع مسبقة (Secure Deposit) لهذا الطلب لردها.');
    }

    const refundAmount = toTwo(Number(escrow.amount));

    // Atomic increment to prevent race conditions
    const updatedClient = await tx.user.update({
      where: { id: request.clientId },
      data: { walletBalance: { increment: refundAmount } },
      select: { id: true, walletBalance: true },
    });

    const refundTx = await tx.transaction.create({
      data: {
        userId: request.clientId,
        requestId,
        amount: refundAmount,
        type: 'REFUND',
        description:
          reason?.trim() || `استرداد أموال للطلب رقم #${requestId}`,
      },
    });

    const updatedRequest = await tx.request.update({
      where: { id: requestId },
      data: { status: 'CLOSED_CANCELLED' },
      select: { id: true, status: true },
    });

    await Notify.refundIssued(request.clientId, requestId, Number(refundAmount));

    // Notify vendor (if one was assigned) that a refund was issued on their order
    const vendorId = request.bids?.[0]?.vendorId;
    if (vendorId) {
      await Notify.send({
        userId: vendorId,
        requestId,
        type: 'REQUEST_CANCELLED',
        title: 'تم إلغاء الطلب ورد الأموال ❌',
        message: `تم إصدار استرداد أموال للطلب #${requestId} من قِبل الإدارة. المبلغ المُعاد: ${refundAmount} ج.م.`,
      }, tx);
    }

    logger.info('notification.created', {
      event: 'refund.issued',
      requestId,
      userId: request.clientId,
      role: 'CLIENT',
    });

    logger.info('refund.request.completed', {
      requestId,
      refundTransactionId: refundTx.id,
      amountRefunded: refundAmount,
    });

    return {
      requestId: updatedRequest.id,
      requestStatus: updatedRequest.status,
      refundTransactionId: refundTx.id,
      amountRefunded: refundAmount,
      newClientWalletBalance: Number(updatedClient.walletBalance),
    };
  }, { timeout: 20000 });
}
