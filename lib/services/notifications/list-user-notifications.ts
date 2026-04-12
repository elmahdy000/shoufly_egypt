import { prisma } from '@/lib/prisma';

export async function listUserNotifications(userId: number, limit = 20, offset = 0) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit,
    skip: offset,
  });
}

