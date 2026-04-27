import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { Notify } from '../notifications/hub';

const DELIVERY_PROGRESS = [
  'ORDER_PLACED',
  'VENDOR_PREPARING',
  'READY_FOR_PICKUP',
  'OUT_FOR_DELIVERY',
  'IN_TRANSIT',
  'DELIVERED',
] as const;

type DeliveryStep = (typeof DELIVERY_PROGRESS)[number];

function isValidForwardTransition(current: DeliveryStep, next: DeliveryStep) {
  const currentIdx = DELIVERY_PROGRESS.indexOf(current);
  const nextIdx = DELIVERY_PROGRESS.indexOf(next);
  return nextIdx >= currentIdx; // Allow same-state updates and forward moves
}

export async function updateDeliveryStatus(params: {
  requestId: number;
  userId: number; // Changed from vendorId for general use
  status: DeliveryStep;
  lat?: number;
  lng?: number;
  note?: string;
  locationText?: string;
}) {
  const { requestId, userId, status, note, locationText } = params;
  logger.info('delivery.status_update.started', { requestId, userId, status });

  return prisma.$transaction(async (tx) => {
    const request = await tx.request.findUnique({
      where: { id: requestId },
      include: {
        bids: {
          where: { status: 'ACCEPTED_BY_CLIENT' },
          select: { id: true, vendorId: true },
        },
        deliveryTracking: {
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          take: 1,
          select: { status: true },
        },
      },
    });

    if (!request) {
      throw new Error('الطلب غير موجود.');
    }

    if (request.status !== 'ORDER_PAID_PENDING_DELIVERY') {
      throw new Error('يجب دفع قيمة الطلب أولاً قبل البدء بتحديثات التوصيل.');
    }

    const isAcceptedVendor = request.bids.some((b) => b.vendorId === userId);
    const isAssignedAgent = request.assignedDeliveryAgentId === userId;

    if (!isAcceptedVendor && !isAssignedAgent) {
      logger.warn('delivery.status_update.unauthorized', { requestId, userId, status });
      throw new Error('عذراً، فقط البائع المقبول أو مندوب التوصيل المخصص يمكنهم تحديث الحالة.');
    }

    // Role-based status restrictions
    if (isAcceptedVendor && !['VENDOR_PREPARING', 'READY_FOR_PICKUP'].includes(status)) {
      throw new Error(`كتاجر، يمكنك فقط تحديد الحالة "قيد التجهيز" أو "جاهز للاستلام".`);
    }

    if (isAssignedAgent && ['VENDOR_PREPARING', 'READY_FOR_PICKUP'].includes(status)) {
      throw new Error(`كمندوب، لا يمكنك تحديد حالات تخص تجهيز التاجر للطلب.`);
    }


    const lastStatus = (request.deliveryTracking[0]?.status || 'ORDER_PLACED') as DeliveryStep;
    if (!isValidForwardTransition(lastStatus, status)) {
      logger.warn('delivery.status_update.invalid_transition', {
        requestId,
        userId,
        from: lastStatus,
        to: status,
      });
      throw new Error(`تسلسل غير صحيح: لا يمكن الانتقال من "${lastStatus}" إلى "${status}" مباشرة.`);
    }

    // NEW: Geofencing Security Guard
    if (status === 'DELIVERED' && isAssignedAgent) {
        if (!params.lat || !params.lng) {
            throw new Error('يجب إرسال إحداثيات الموقع (GPS) لإتمام عملية التوصيل.');
        }
        const { verifyDeliveryLocation } = await import('./verify-location');
        await verifyDeliveryLocation(requestId, params.lat, params.lng);
        logger.info('delivery.geofence.passed', { requestId, userId });
    }

    const tracking = await tx.deliveryTracking.create({
      data: { requestId, status, note: note || null, locationText: locationText || null },
    });

    // Real-time broadcast to client
    await Notify.deliveryUpdate(request.clientId, requestId, status);

    logger.info('delivery.status_update.completed', {
      requestId,
      userId,
      status: tracking.status,
      trackingId: tracking.id,
    });

    return tracking;
  });
}
