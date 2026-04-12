import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

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
  return nextIdx === currentIdx + 1;
}

export async function updateDeliveryStatus(params: {
  requestId: number;
  vendorId: number;
  status: DeliveryStep;
  note?: string;
  locationText?: string;
}) {
  const { requestId, vendorId, status, note, locationText } = params;
  logger.info('delivery.status_update.started', { requestId, vendorId, status });

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
      logger.warn('delivery.status_update.request_not_found', { requestId, vendorId, status });
      throw new Error('Request not found');
    }

    if (request.status !== 'ORDER_PAID_PENDING_DELIVERY') {
      logger.warn('delivery.status_update.invalid_request_state', {
        requestId,
        vendorId,
        status,
        requestStatus: request.status,
      });
      throw new Error('Delivery updates require paid request state');
    }

    const acceptedBid = request.bids.find((b) => b.vendorId === vendorId);
    if (!acceptedBid) {
      logger.warn('delivery.status_update.vendor_not_owner', { requestId, vendorId, status });
      throw new Error('Only vendor owning accepted bid can update delivery');
    }

    // Role-based status restrictions: Vendors can only set preparing or ready
    if (status !== 'VENDOR_PREPARING' && status !== 'READY_FOR_PICKUP') {
      throw new Error(`Vendors cannot update delivery to status: ${status}`);
    }


    const lastStatus = (request.deliveryTracking[0]?.status || 'ORDER_PLACED') as DeliveryStep;
    if (!isValidForwardTransition(lastStatus, status)) {
      logger.warn('delivery.status_update.invalid_transition', {
        requestId,
        vendorId,
        from: lastStatus,
        to: status,
      });
      throw new Error(`Invalid delivery transition: ${lastStatus} -> ${status}`);
    }

    const tracking = await tx.deliveryTracking.create({
      data: {
        requestId,
        status,
        note: note || null,
        locationText: locationText || null,
      },
    });

    await tx.notification.create({
      data: {
        userId: request.clientId,
        type: 'DELIVERY_UPDATE',
        title: 'Delivery Updated',
        message: `Request #${requestId} delivery moved to ${status}.`,
      },
    });

    logger.info('notification.created', {
      event: 'delivery.updated',
      requestId,
      userId: request.clientId,
      role: 'CLIENT',
    });

    logger.info('delivery.status_update.completed', {
      requestId,
      vendorId,
      status,
      trackingId: tracking.id,
    });

    return tracking;
  });
}
