import { prisma } from '@/lib/prisma';

export async function listAdminUsers(limit = 20, offset = 0) {
  return prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      walletBalance: true,
      createdAt: true,
    },
    orderBy: { id: 'asc' },
    take: limit,
    skip: offset,
  });
}

