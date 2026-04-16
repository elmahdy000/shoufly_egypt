import { prisma } from '@/lib/prisma';

export async function listAdminUsers(limit = 20, offset = 0, role?: string) {
  const where = role ? { role: role as any } : {};
  return prisma.user.findMany({
    where,
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

