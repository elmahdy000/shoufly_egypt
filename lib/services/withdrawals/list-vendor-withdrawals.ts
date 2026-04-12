import { prisma } from '@/lib/prisma';

export async function listVendorWithdrawals(vendorId: number) {
  return prisma.withdrawalRequest.findMany({
    where: { vendorId },
    include: {
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
