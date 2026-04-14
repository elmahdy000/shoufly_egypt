import { prisma } from '@/lib/prisma';

export async function markAllNotificationsRead(userId: number) {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  return { count: result.count };
}
