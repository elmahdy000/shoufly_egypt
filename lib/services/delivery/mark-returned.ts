import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { Notify } from '../notifications/hub';

type ActorRole = 'VENDOR' | 'ADMIN';

export async function markReturned(params: {
  requestId: number;
  actorId: number;
  actorRole: ActorRole;
  note?: string;
  locationText?: string;
}) {
  const { requestId, actorId, actorRole, note, locationText } = params;
  logger.info('delivery.returned.started', { requestId, actorId, actorRole });

  return prisma.$transaction(async (tx) => {
    const request = await tx.request.findUnique({
      where: { id: requestId },
      include: {
        bids: {
          where: { status: 'ACCEPTED_BY_CLIENT' },
          select: { vendorId: true },
        },
      },
    });

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status === 'CLOSED_SUCCESS') {
      throw new Error('Cannot return closed successful request');
    }

    if (request.status !== 'ORDER_PAID_PENDING_DELIVERY') {
      throw new Error('Returned state can only be set for paid requests');
    }

    if (actorRole === 'VENDOR') {
      const ownedBid = request.bids.find((b) => b.vendorId === actorId);
      if (!ownedBid) {
        throw new Error('Only vendor owning accepted bid can mark returned');
      }
    }

    const last = await tx.deliveryTracking.findFirst({
      where: { requestId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: { status: true },
    });

    if (last?.status === 'RETURNED') {
      throw new Error('Delivery is already marked as returned');
    }

    const entry = await tx.deliveryTracking.create({
      data: {
        requestId,
        status: 'RETURNED',
        note: note || `Order marked as returned by ${actorRole.toLowerCase()}`,
        locationText: locationText || null,
      },
    });

    await tx.request.update({
      where: { id: requestId },
      data: { 
        status: 'PENDING_ADMIN_REVISION',
        notes: `تم إرجاع الطلب بواسطة ${actorRole === 'ADMIN' ? 'الإدارة' : 'المورد'}. ملاحظة: ${note || 'لا يوجد'}`
      },
    });

    await Notify.send({
      userId: request.clientId,
      type: 'DELIVERY_FAILED',
      title: 'تم إرجاع الطلب 🔙',
      message: `تم تسجيل الطلب رقم #${requestId} كمرتجع. الإدارة ستقوم بمراجعة التفاصيل لرد المبلغ لمحفظتك.`,
      requestId,
    }, tx);

    const admins = await tx.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    if (admins.length > 0) {
      await Notify.bulkSend(admins.map((a: { id: number }) => ({
        userId: a.id,
        type: 'DELIVERY_FAILED',
        title: 'طلب مرتجع - مراجعة مطلوبة 🚨',
        message: `تم تسجيل الطلب رقم #${requestId} كمرتجع. يرجى مراجعة مبالغ الأمانات واتخاذ قرار الاسترداد.`,
        requestId,
      })), tx);
    }


    logger.info('notification.created', {
      event: 'delivery.returned',
      requestId,
      userId: request.clientId,
      role: 'CLIENT',
    });

    logger.info('delivery.returned.completed', {
      requestId,
      actorId,
      actorRole,
      trackingId: entry.id,
    });

    return entry;
  });
}
