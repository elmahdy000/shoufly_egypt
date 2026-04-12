import { NotificationType } from '@/app/generated/prisma';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

export async function createNotification(params: {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  requestId?: number;
  metadata?: any;
}) {
  const { userId, type, title, message, requestId, metadata } = params;
  const created = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      requestId,
      metadata,
    },
    include: {
      user: { select: { fcmToken: true } }
    }
  });

  // 1. Trigger real-time SSE notification
  const { notificationEmitter } = await import('@/lib/utils/event-emitter');
  notificationEmitter.sendNotification(userId, created);

  // 2. Trigger native Push Notification if token exists
  if (created.user.fcmToken) {
    const { sendPushNotification } = await import('./push-notification');
     sendPushNotification(created.user.fcmToken, {
      title: created.title,
      body: created.message,
      data: {
        type: created.type,
        requestId: created.requestId?.toString(),
        notificationId: created.id.toString(),
      }
    }).catch(err => logger.error('push.notification.async.failed', { err }));
  }

  logger.info('notification.created', {
    notificationId: created.id,
    userId,
    type,
    sentPush: !!created.user.fcmToken
  });

  return created;
}
