import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

function toTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

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
      },
    });

    if (!request) {
      logger.warn('refund.request.not_found', { requestId });
      throw new Error('Request not found');
    }

    if (request.status === 'CLOSED_SUCCESS') {
      throw new Error('Cannot refund successfully closed request');
    }

    const alreadyRefunded = request.transactions.some((txr) => txr.type === 'REFUND');
    if (alreadyRefunded) {
      logger.warn('refund.request.duplicate', { requestId });
      throw new Error('Refund already issued for this request');
    }

    const escrow = request.transactions.find((txr) => txr.type === 'ESCROW_DEPOSIT');
    if (!escrow) {
      logger.warn('refund.request.no_escrow', { requestId });
      throw new Error('No escrow deposit found for this request');
    }

    const refundAmount = toTwo(Number(escrow.amount));
    const newBalance = toTwo(Number(request.client.walletBalance) + refundAmount);

    const updatedClient = await tx.user.update({
      where: { id: request.clientId },
      data: { walletBalance: newBalance },
      select: { id: true, walletBalance: true },
    });

    const refundTx = await tx.transaction.create({
      data: {
        userId: request.clientId,
        requestId,
        amount: refundAmount,
        type: 'REFUND',
        description:
          reason?.trim() || `Refund issued for request #${requestId}`,
      },
    });

    const updatedRequest = await tx.request.update({
      where: { id: requestId },
      data: { status: 'CLOSED_CANCELLED' },
      select: { id: true, status: true },
    });

    await tx.notification.create({
      data: {
        userId: request.clientId,
        type: 'REFUND_ISSUED',
        title: 'Refund Issued',
        message: `Refund for request #${requestId} has been credited to your wallet.`,
      },
    });

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
  });
}
