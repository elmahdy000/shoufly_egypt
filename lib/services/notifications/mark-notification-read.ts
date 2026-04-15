import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

export async function markNotificationRead(notificationId: number, userId: number) {
  logger.info('notification.mark.read.started', { notificationId, userId });

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { id: true, userId: true, isRead: true },
  });

  if (!notification) {
    logger.warn('notification.mark.read.not_found', { notificationId, userId });
    throw new Error('Notification not found');
  }

  if (notification.userId !== userId) {
    logger.warn('notification.mark.read.forbidden', { notificationId, userId, ownerId: notification.userId });
    throw new Error('Forbidden');
  }

  if (notification.isRead) {
    logger.info('notification.mark.read.already_read', { notificationId, userId });
    return notification;
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  logger.info('notification.mark.read.completed', { notificationId, userId });
  return updated;
}
