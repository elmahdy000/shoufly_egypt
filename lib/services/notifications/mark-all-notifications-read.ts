import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

export async function markAllNotificationsRead(userId: number) {
  logger.info('notification.mark.all.started', { userId });

  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });

  logger.info('notification.mark.all.completed', { userId, count: result.count });
  return { count: result.count };
}
