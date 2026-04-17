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
  try {
    const eventPayload = JSON.stringify({
      ...notification,
      timestamp: new Date().toISOString()
    });

    await redis.publish(`user_notifications:${payload.userId}`, eventPayload);
    await redis.publish('admin_shoofty_stream', eventPayload);
    console.log(`📡 [Real-time Hub] Notification Sent to User ${payload.userId}: [${payload.title}]`);
  } catch (err: any) {
    console.warn('Notification broadcast failed but saved to DB:', err.message);
  }

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
      title: 'نزاع جديد! ⚠️',
      message: `قام العميل بفتح نزاع على الطلب #${requestId}. السبب: ${reason}`
    }),

  requestApproved: (userId: number, requestId: number, title: string) =>
    sendNotification({
      userId,
      requestId,
      type: 'NEW_REQUEST',
      title: 'تمت الموافقة على طلبك! ✅',
      message: `تمت الموافقة على طلبك "${title}" وهو الآن متاح لاستقبال العروض.`
    }),

  requestRejected: (userId: number, requestId: number, title: string) =>
    sendNotification({
      userId,
      requestId,
      type: 'REQUEST_CANCELLED',
      title: 'تم رفض الطلب ❌',
      message: `نعتذر، تم رفض طلبك "${title}" من قبل الإدارة.`
    }),

  refundIssued: (userId: number, requestId: number, amount: number) =>
    sendNotification({
      userId,
      requestId,
      type: 'REFUND_ISSUED',
      title: 'تم استرداد الأموال! 💰',
      message: `تمت إعادة مبلغ ${amount} ج.م إلى محفظتك للطلب #${requestId}.`
    }),

  withdrawalStatus: (userId: number, withdrawalId: number, status: 'APPROVED' | 'REJECTED') =>
    sendNotification({
      userId,
      type: status === 'APPROVED' ? 'WITHDRAWAL_APPROVED' : 'WITHDRAWAL_REJECTED',
      title: status === 'APPROVED' ? 'تمت الموافقة على السحب! ✅' : 'فشل طلب السحب ❌',
      message: status === 'APPROVED' 
        ? `طلب السحب رقم #${withdrawalId} تمت الموافقة عليه بنجاح.`
        : `نعتذر، تم رفض طلب السحب رقم #${withdrawalId}.`
    }),

  orderCompleted: (userId: number, requestId: number) =>
    sendNotification({
      userId,
      requestId,
      type: 'DELIVERY_UPDATE',
      title: 'تم اكتمال الطلب! 🎉',
      message: `تم تأكيد استلام الطلب رقم #${requestId} وإغلاقه بنجاح.`
    }),

  payoutReceived: (userId: number, requestId: number, amount: number) =>
    sendNotification({
      userId,
      requestId,
      type: 'PAYMENT_RECEIVED',
      title: 'تم تحويل مستحقاتك! 💸',
      message: `تم تحويل مبلغ ${amount} ج.م إلى محفظتك عن الطلب #${requestId}.`
    }),

  disputeResolved: (userId: number, requestId: number, role: 'CLIENT' | 'VENDOR', amount: number) =>
    sendNotification({
      userId,
      requestId,
      type: role === 'CLIENT' ? 'REFUND_ISSUED' : 'PAYMENT_RECEIVED',
      title: 'تم حل النزاع! ⚖️',
      message: role === 'CLIENT' 
        ? `تم حل النزاع واسترداد مبلغ ${amount} ج.م إلى محفظتك.`
        : `تم حل النزاع وحصلت على تعويض بمبلغ ${amount} ج.م.`
    })
};
