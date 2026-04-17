import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

/**
 * Registers or updates the Firebase Cloud Messaging (FCM) token for a user.
 * This enables the server to send push notifications to the user's mobile device.
 */
export async function updateFcmToken(userId: number, fcmToken: string) {
  logger.info('notification.fcm.update', { userId });

  if (!fcmToken || fcmToken.trim() === '') {
    throw new Error('FCM token is required');
  }

  return prisma.user.update({
    where: { id: userId },
    data: { 
      fcmToken,
      updatedAt: new Date()
    },
    select: { id: true, fullName: true, fcmToken: true }
  });
}
