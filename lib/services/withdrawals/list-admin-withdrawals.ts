import { prisma } from '@/lib/prisma';

export async function listAdminWithdrawals() {
  return prisma.withdrawalRequest.findMany({
    include: {
      vendor: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      reviewedBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });
}
