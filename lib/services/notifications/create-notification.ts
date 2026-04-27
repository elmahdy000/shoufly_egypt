import { NotificationType } from '@/app/generated/prisma';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { Notify } from './hub';

export async function createNotification(params: {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  requestId?: number;
  metadata?: any;
}) {
  const { userId, type, title, message, requestId, metadata } = params;

  // 1. Use the Unified Notify Hub for DB persistence + Redis broadcast
  // This triggers the Redis Subscriber which then triggers the local SSE stream.
  const notification = await Notify.send({
    userId,
    type,
    title,
    message,
    requestId,
    metadata
  });

  // 2. Fetch user for FCM token (Hub doesn't do Push Notifications yet)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { fcmToken: true }
  });

  // 3. Trigger native Push Notification if token exists
  if (user?.fcmToken) {
    const { sendPushNotification } = await import('./push-notification');
     sendPushNotification(user.fcmToken, {
      title: notification.title,
      body: notification.message,
      data: {
        type: notification.type,
        ...(notification.requestId && { requestId: String(notification.requestId) }),
        notificationId: notification.id.toString(),
      }
    }).catch(err => logger.error('push.notification.async.failed', { err }));
  }

  logger.info('notification.created', {
    notificationId: notification.id,
    userId,
    type,
    sentPush: !!user?.fcmToken
  });

  return notification;
}
