import { prisma } from '@/lib/prisma';

export async function listAdminTransactions(limit = 50, offset = 0) {
  return prisma.transaction.findMany({
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          role: true,
        },
      },
      request: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit,
    skip: offset,
  });
}

