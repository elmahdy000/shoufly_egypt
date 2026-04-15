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
      isVerified: true,
      isBlocked: true,
      walletBalance: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          clientRequests: true,
          vendorBids: true,
          assignedDeliveries: true,
          transactions: true,
          complaints: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: limit,
    skip: offset,
  });
}

