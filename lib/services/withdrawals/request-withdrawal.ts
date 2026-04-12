import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

function toTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

export async function requestWithdrawal(vendorId: number, amount: number) {
  logger.info('withdrawal.request.started', { vendorId, amount });
  return prisma.$transaction(async (tx) => {
    const vendor = await tx.user.findUnique({
      where: { id: vendorId },
      select: { id: true, role: true, walletBalance: true, isActive: true },
    });

    if (!vendor || vendor.role !== 'VENDOR' || !vendor.isActive) {
      throw new Error('Only active vendors can request withdrawals');
    }

    const wallet = toTwo(Number(vendor.walletBalance));
    const requested = toTwo(amount);

    if (requested > wallet) {
      throw new Error('Requested withdrawal exceeds available balance');
    }


    const created = await tx.withdrawalRequest.create({
      data: {
        vendorId,
        amount: requested,
        status: 'PENDING',
      },
    });

    // CRITICAL: Deduct from wallet immediately (hold funds)
    await tx.user.update({
      where: { id: vendorId },
      data: { walletBalance: { decrement: requested } }
    });


    const admins = await tx.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    if (admins.length > 0) {
      await tx.notification.createMany({
        data: admins.map((a) => ({
          userId: a.id,
          type: 'WITHDRAWAL_REQUESTED',
          title: 'New Withdrawal Request',


          message: `Vendor #${vendorId} requested withdrawal of ${requested}.`,
        })),
      });
      logger.info('notification.created', {
        event: 'withdrawal.requested',
        withdrawalId: created.id,
        recipients: admins.map((a) => a.id),
        role: 'ADMIN',
      });
    }

    logger.info('withdrawal.request.completed', {
      withdrawalId: created.id,
      vendorId,
      amount: requested,
      status: created.status,
    });

    return {
      id: created.id,
      vendorId: created.vendorId,
      amount: Number(created.amount),
      status: created.status,
      availableBalance: wallet - requested,
    };

  });
}
