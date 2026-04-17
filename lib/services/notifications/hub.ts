import { prisma } from '../../prisma';
import redis from '../../redis';
import { NotificationType } from '../../../app/generated/prisma';

interface NotificationPayload {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  requestId?: number;
  metadata?: any;
}

export async function sendNotification(payload: NotificationPayload) {
  // 1. Persistence in DB
  const notification = await prisma.notification.create({
    data: {
      userId: payload.userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      requestId: payload.requestId,
      metadata: payload.metadata || {}
    }
  });

  // 2. Real-time Broadcast via Redis (Pub/Sub)
  // We publish to a specific user channel and a global admin channel
  const eventPayload = JSON.stringify({
    ...notification,
    timestamp: new Date().toISOString()
  });

  await redis.publish(`user_notifications:${payload.userId}`, eventPayload);
  await redis.publish('admin_shoofty_stream', eventPayload);

  // 3. Optional: Trigger Push Notification (FCM Placeholder)
  // if (user.fcmToken) { ... }

  console.log(`📡 [Real-time Hub] Notification Sent to User ${payload.userId}: [${payload.title}]`);
  
  return notification;
}

/**
 * Convenience helper for common events
 */
export const Notify = {
  send: sendNotification,
  newBid: (userId: number, requestId: number, amount: number) => 
    sendNotification({
      userId,
      requestId,
      type: 'NEW_BID',
      title: 'عرض سعر جديد! 💸',
      message: `تم تقديم عرض سعر جديد بقيمة ${amount} ج.م على طلبك.`
    }),

  bidAccepted: (userId: number, requestId: number) =>
    sendNotification({
      userId,
      requestId,
      type: 'BID_ACCEPTED',
      title: 'تم قبول عرضك! 🎉',
      message: 'قام العميل بقبول عرض السعر الخاص بك، يرجى البدء في التنفيذ.'
    }),

  deliveryUpdate: (userId: number, requestId: number, statusText: string) =>
    sendNotification({
      userId,
      requestId,
      type: 'DELIVERY_UPDATE',
      title: 'تحديث في التوصيل 🚚',
      message: `حالة طلبك الآن: ${statusText}`
    }),

  paymentConfirmed: (userId: number, requestId: number, amount: number) =>
    sendNotification({
      userId,
      requestId,
      type: 'PAYMENT_RECEIVED',
      title: 'تم تأكيد الدفع! 💰',
      message: `قام العميل بدفع مبلغ ${amount} ج.م. الأموال الآن في أمان "شوفلي"، يمكنك البدء في التنفيذ.`
    }),

  disputeRaised: (userId: number, requestId: number, reason: string) =>
    sendNotification({
      userId,
      requestId,
      type: 'OFFER_RECEIVED',
      title: 'نزاع جديد مشحون ⚠️',
      message: `قام العميل بفتح نزاع على الطلب #${requestId}. السبب: ${reason}`
    })
};
