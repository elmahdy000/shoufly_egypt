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
  return nextIdx === currentIdx + 1;
}

export async function updateDeliveryStatus(params: {
  requestId: number;
  userId: number; // Changed from vendorId for general use
  status: DeliveryStep;
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
      throw new Error('Request not found');
    }

    if (request.status !== 'ORDER_PAID_PENDING_DELIVERY') {
      throw new Error('Delivery updates require paid request state');
    }

    const isAcceptedVendor = request.bids.some((b) => b.vendorId === userId);
    const isAssignedAgent = request.assignedDeliveryAgentId === userId;

    if (!isAcceptedVendor && !isAssignedAgent) {
      logger.warn('delivery.status_update.unauthorized', { requestId, userId, status });
      throw new Error('Only the assigned vendor or delivery agent can update status');
    }

    // Role-based status restrictions
    if (isAcceptedVendor && !['VENDOR_PREPARING', 'READY_FOR_PICKUP'].includes(status)) {
      throw new Error(`Vendors can only set PREPARING or READY_FOR_PICKUP`);
    }

    if (isAssignedAgent && ['VENDOR_PREPARING', 'READY_FOR_PICKUP'].includes(status)) {
      throw new Error(`Delivery agents cannot set vendor-specific statuses`);
    }


    const lastStatus = (request.deliveryTracking[0]?.status || 'ORDER_PLACED') as DeliveryStep;
    if (!isValidForwardTransition(lastStatus, status)) {
      logger.warn('delivery.status_update.invalid_transition', {
        requestId,
        userId,
        from: lastStatus,
        to: status,
      });
      throw new Error(`Invalid delivery transition: ${lastStatus} -> ${status}`);
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
