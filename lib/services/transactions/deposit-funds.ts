import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

function toTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

export async function depositFunds(userId: number, amount: number, existingTransactionId?: number) {
  logger.info('wallet.deposit.started', { userId, amount, existingTransactionId });

  if (amount <= 0) {
    throw new Error('Deposit amount must be positive');
  }

  const depositAmount = toTwo(amount);

  return prisma.$transaction(async (tx) => {
    // 1. Security check: Is user active?
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, walletBalance: true, isBlocked: true, isActive: true },
    });

    if (!user) throw new Error('User not found');
    if (!user.isActive || user.isBlocked) {
      throw new Error('Account is inactive or blocked. Cannot deposit funds.');
    }

    // 2. Update Balance
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        walletBalance: {
          increment: depositAmount,
        },
      },
    });

    // 3. Handle Transaction Record (Avoid Duplicates)
    let transaction;
    if (existingTransactionId) {
       // Update existing record if it exists
       transaction = await tx.transaction.update({
         where: { id: existingTransactionId },
         data: {
           amount: depositAmount,
           type: 'WALLET_TOPUP',
           description: `Wallet top-up (Confirmed) - ${depositAmount}`,
           metadata: { 
             status: 'SUCCESS',
             confirmedAt: new Date().toISOString()
           }
         }
       });
    } else {
      // Create new record only if no ID provided
      transaction = await tx.transaction.create({
        data: {
          userId,
          amount: depositAmount,
          type: 'WALLET_TOPUP',
          description: `Wallet top-up of ${depositAmount}`,
        },
      });
    }

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
