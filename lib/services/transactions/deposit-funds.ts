import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { toTwo } from '@/lib/utils/decimal';
import { Notify } from '../notifications/hub';

type LockedTransactionRow = {
  id: number;
  userId: number;
  amount: unknown;
  metadata: unknown;
};

export async function depositFunds(userId: number, amount: number, existingTransactionId?: number, idempotencyKey?: string) {
  logger.info('wallet.deposit.started', { userId, amount, existingTransactionId, idempotencyKey });

  if (amount <= 0) {
    throw new Error('Deposit amount must be positive');
  }

  const depositAmount = toTwo(amount);

  return prisma.$transaction(async (tx) => {
    let lockedTransaction: LockedTransactionRow | null = null;

    if (existingTransactionId) {
      const rows = await tx.$queryRaw<LockedTransactionRow[]>`
        SELECT id, "userId", amount, metadata
        FROM "Transaction"
        WHERE id = ${existingTransactionId}
        FOR UPDATE
      `;

      lockedTransaction = rows[0] ?? null;
      if (!lockedTransaction) {
        throw new Error('Transaction not found');
      }

      if (lockedTransaction.userId !== userId) {
        throw new Error('Transaction does not belong to user');
      }

      const existingMetadata = (lockedTransaction.metadata as Record<string, unknown> | null) || {};
      if (existingMetadata.status === 'SUCCESS') {
        logger.warn('wallet.deposit.duplicate_detected', { existingTransactionId });

        const existingUser = await tx.user.findUnique({
          where: { id: userId },
          select: { walletBalance: true },
        });

        return {
          transactionId: existingTransactionId,
          alreadyProcessed: true,
          amount: Number(lockedTransaction.amount),
          newBalance: Number(existingUser?.walletBalance ?? 0),
        };
      }
    }

    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, walletBalance: true, isBlocked: true, isActive: true },
    });

    if (!user) throw new Error('User not found');
    if (!user.isActive || user.isBlocked) {
      throw new Error('Account is inactive or blocked. Cannot deposit funds.');
    }

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        walletBalance: {
          increment: depositAmount,
        },
      },
    });

    let transaction;
    if (existingTransactionId) {
      const existingMetadata = (lockedTransaction?.metadata as Record<string, unknown> | null) || {};

      transaction = await tx.transaction.update({
        where: { id: existingTransactionId },
        data: {
          amount: depositAmount,
          type: 'WALLET_TOPUP',
          description: `Wallet top-up (Confirmed) - ${depositAmount}`,
          metadata: {
            ...existingMetadata,
            status: 'SUCCESS',
            confirmedAt: new Date().toISOString(),
            ...(idempotencyKey && { idempotencyKey }),
          },
        },
      });
    } else {
      transaction = await tx.transaction.create({
        data: {
          userId,
          amount: depositAmount,
          type: 'WALLET_TOPUP',
          description: `Wallet top-up of ${depositAmount}`,
          metadata: {
            status: 'SUCCESS',
            confirmedAt: new Date().toISOString(),
            ...(idempotencyKey && { idempotencyKey }),
          },
        },
      });
    }

    await Notify.send({
      userId,
      type: 'WALLET_TOPUP',
      title: 'تم شحن المحفظة! ✅',
      message: `تمت إضافة مبلغ ${depositAmount} ج.م إلى محفظتك بنجاح.`,
    }, tx);

    logger.info('wallet.deposit.completed', {
      userId,
      amount: depositAmount,
      transactionId: transaction.id,
      newBalance: Number(updatedUser.walletBalance),
    });

    return {
      transactionId: transaction.id,
      amount: depositAmount,
      newBalance: Number(updatedUser.walletBalance),
    };
  });
}
