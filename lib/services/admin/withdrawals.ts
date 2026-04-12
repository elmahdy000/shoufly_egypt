import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

export async function listWithdrawals(status?: 'PENDING' | 'APPROVED' | 'REJECTED') {
  return prisma.withdrawalRequest.findMany({
    where: status ? { status } : {},
    include: {
      vendor: {
        select: { id: true, fullName: true, email: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function reviewWithdrawal(params: {
  withdrawalId: number;
  adminId: number;
  status: 'APPROVED' | 'REJECTED';
  note?: string;
}) {
  const { withdrawalId, adminId, status, note } = params;
  
  return prisma.$transaction(async (tx) => {
    const withdrawal = await tx.withdrawalRequest.findUnique({
      where: { id: withdrawalId },
      include: { vendor: true }
    });

    if (!withdrawal) throw new Error('Withdrawal request not found');
    if (withdrawal.status !== 'PENDING') throw new Error('Withdrawal already processed');

    // If REJECTED, refund vendor wallet
    if (status === 'REJECTED') {
      await tx.user.update({
        where: { id: withdrawal.vendorId },
        data: {
          walletBalance: { increment: withdrawal.amount }
        }
      });
    }

    const updated = await tx.withdrawalRequest.update({
      where: { id: withdrawalId },
      data: {
        status,
        reviewNote: note,
        reviewedById: adminId,
        reviewedAt: new Date()
      }
    });

    logger.info('withdrawal.reviewed', { withdrawalId, adminId, status });
    
    // Notify vendor
    await tx.notification.create({
        data: {
            userId: withdrawal.vendorId,
            type: status === 'APPROVED' ? 'WITHDRAWAL_APPROVED' : 'WITHDRAWAL_REJECTED',
            title: status === 'APPROVED' ? 'Withdrawal Approved' : 'Withdrawal Rejected',
            message: status === 'APPROVED' 
                ? `Your withdrawal of ${withdrawal.amount} EGP has been approved.`
                : `Your withdrawal has been rejected. Reason: ${note || 'N/A'}`
        }
    });

    return updated;
  });
}
