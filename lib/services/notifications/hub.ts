import { prisma as defaultPrisma } from '../../prisma';
import { logger } from '../../utils/logger';
import { getRedisClient } from '../../redis';
import { NotificationType } from '../../../app/generated/prisma';

interface NotificationPayload {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  requestId?: number;
  metadata?: any;
}

/**
 * Sends a single notification, persists to DB, and broadcasts to Redis.
 * Supports an optional transaction client (tx).
 */
export async function sendNotification(payload: NotificationPayload, tx?: any) {
  const client = tx || defaultPrisma;
  
  // 1. Persistence in DB
  const notification = await client.notification.create({
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
    const redis = getRedisClient();
    const eventPayload = JSON.stringify({
      ...notification,
      timestamp: new Date().toISOString()
    });

    await redis.publish(`user_notifications:${payload.userId}`, eventPayload);
    await redis.publish('admin_shoofty_stream', eventPayload);

    logger.info('notification.broadcast.success', { userId: payload.userId, title: payload.title });
  } catch (err: any) {
    logger.warn('notification.broadcast.failed', { error: err.message });
  }

  return notification;
}

/**
 * Sends multiple notifications to different users (e.g., bulk alerts to vendors).
 */
export async function bulkSend(payloads: NotificationPayload[], tx?: any) {
    const client = tx || defaultPrisma;
    
    // 1. Bulk creation in DB
    // Note: createMany is faster but doesn't return the IDs in all DBs. 
    // For real-time broadcast, we need to ensure each one is published.
    
    // If it's a small number, we can do them in parallel.
    // If it's very large, we might need a background job.
    
    const results = await Promise.all(payloads.map(p => sendNotification(p, client)));
    return results;
}

/**
 * Convenience helper for common events
 */
export const Notify = {
  send: sendNotification,
  bulkSend: bulkSend,
  // ... rest of methods ...
  newBid: (userId: number, requestId: number, amount: number, tx?: any) => 
    sendNotification({
      userId,
      requestId,
      type: 'NEW_BID',
      title: 'عرض سعر جديد! 💸',
      message: `تم تقديم عرض سعر جديد بقيمة ${amount} ج.م على طلبك.`
    }, tx),

  bidAccepted: (userId: number, requestId: number, tx?: any) =>
    sendNotification({
      userId,
      requestId,
      type: 'BID_ACCEPTED',
      title: 'تم قبول عرضك! 🎉',
      message: 'قام العميل بقبول عرض السعر الخاص بك، يرجى البدء في التنفيذ.'
    }, tx),

  deliveryUpdate: (userId: number, requestId: number, statusText: string, tx?: any) =>
    sendNotification({
      userId,
      requestId,
      type: 'DELIVERY_UPDATE',
      title: 'تحديث في التوصيل 🚚',
      message: `حالة طلبك الآن: ${statusText}`
    }, tx),

  paymentConfirmed: (userId: number, requestId: number, amount: number, tx?: any) =>
    sendNotification({
      userId,
      requestId,
      type: 'PAYMENT_RECEIVED',
      title: 'تم تأكيد الدفع! 💰',
      message: `قام العميل بدفع مبلغ ${amount} ج.م. الأموال الآن في أمان "شوفلي"، يمكنك البدء في التنفيذ.`
    }, tx),

  disputeRaised: (userId: number, requestId: number, reason: string, tx?: any) =>
    sendNotification({
      userId,
      requestId,
      type: 'DISPUTE_RAISED',
      title: 'نزاع جديد! ⚠️',
      message: `قام العميل بفتح نزاع على الطلب #${requestId}. السبب: ${reason}`
    }, tx),

  requestApproved: (userId: number, requestId: number, title: string, tx?: any) =>
    sendNotification({
      userId,
      requestId,
      type: 'NEW_REQUEST',
      title: 'تمت الموافقة على طلبك! ✅',
      message: `تمت الموافقة على طلبك "${title}" وهو الآن متاح لاستقبال العروض.`
    }, tx),

  requestRejected: (userId: number, requestId: number, title: string, tx?: any) =>
    sendNotification({
      userId,
      requestId,
      type: 'REQUEST_CANCELLED',
      title: 'تم رفض الطلب ❌',
      message: `نعتذر، تم رفض طلبك "${title}" من قبل الإدارة.`
    }, tx),

  refundIssued: (userId: number, requestId: number, amount: number, tx?: any) =>
    sendNotification({
      userId,
      requestId,
      type: 'REFUND_ISSUED',
      title: 'تم استرداد الأموال! 💰',
      message: `تمت إعادة مبلغ ${amount} ج.م إلى محفظتك للطلب #${requestId}.`
    }, tx),

  withdrawalStatus: (userId: number, withdrawalId: number, status: 'APPROVED' | 'REJECTED', amount: number, tx?: any) =>
    sendNotification({
      userId,
      type: status === 'APPROVED' ? 'WITHDRAWAL_APPROVED' : 'WITHDRAWAL_REJECTED',
      title: status === 'APPROVED' ? 'تمت الموافقة على السحب! ✅' : 'فشل طلب السحب ❌',
      message: status === 'APPROVED' 
        ? `طلب السحب رقم #${withdrawalId} بمبلغ ${amount} ج.م تمت الموافقة عليه بنجاح.`
        : `نعتذر، تم رفض طلب السحب رقم #${withdrawalId} بمبلغ ${amount} ج.م.`
    }, tx),

  orderCompleted: (userId: number, requestId: number, tx?: any) =>
    sendNotification({
      userId,
      requestId,
      type: 'DELIVERY_UPDATE',
      title: 'تم اكتمال الطلب! 🎉',
      message: `تم تأكيد استلام الطلب رقم #${requestId} وإغلاقه بنجاح.`
    }, tx),

  payoutReceived: (userId: number, requestId: number, amount: number, tx?: any) =>
    sendNotification({
      userId,
      requestId,
      type: 'PAYMENT_RECEIVED',
      title: 'تم تحويل مستحقاتك! 💸',
      message: `تم تحويل مبلغ ${amount} ج.م إلى محفظتك عن الطلب #${requestId}.`
    }, tx),

  disputeResolved: (userId: number, requestId: number, role: 'CLIENT' | 'VENDOR', amount: number, tx?: any) =>
    sendNotification({
      userId,
      requestId,
      type: 'DISPUTE_RESOLVED',
      title: 'تم حل النزاع! ⚖️',
      message: role === 'CLIENT' 
        ? `تم حل النزاع واسترداد مبلغ ${amount} ج.م إلى محفظتك.`
        : `تم حل النزاع وحصلت على تعويض بمبلغ ${amount} ج.م.`
    }, tx),

  taskDispatched: (userId: number, requestId: number, tx?: any) =>
    sendNotification({
      userId,
      requestId,
      type: 'REQUEST_DISPATCHED',
      title: 'مهمة توصيل جديدة! 📦',
      message: `لديك مهمة توصيل جديدة للطلب #${requestId}. يرجى تأكيد الاستلام.`
    }, tx)
};
