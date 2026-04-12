import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

function toTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

export async function depositFunds(userId: number, amount: number) {
  logger.info('wallet.deposit.started', { userId, amount });

  if (amount <= 0) {
    throw new Error('Deposit amount must be positive');
  }

  const depositAmount = toTwo(amount);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, walletBalance: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        walletBalance: {
          increment: depositAmount,
        },
      },
      select: { id: true, walletBalance: true },
    });

    const transaction = await tx.transaction.create({
      data: {
        userId,
        amount: depositAmount,
        type: 'WALLET_TOPUP',
        description: `Wallet top-up of ${depositAmount}`,
      },
    });

    await tx.notification.create({
      data: {
        userId,
        type: 'WALLET_TOPUP',
        title: 'Wallet Topped Up',
        message: `Successfully added ${depositAmount} to your wallet.`,
      },
    });

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
