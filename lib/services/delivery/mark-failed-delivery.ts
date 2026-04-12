import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

export async function markFailedDelivery(params: {
  requestId: number;
  vendorId: number;
  note?: string;
  locationText?: string;
}) {
  const { requestId, vendorId, note, locationText } = params;
  logger.info('delivery.failed.started', { requestId, vendorId });

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
      throw new Error('Cannot fail delivery for closed successful request');
    }

    if (request.status !== 'ORDER_PAID_PENDING_DELIVERY') {
      throw new Error('Failed delivery can only be marked after payment');
    }

    const ownedBid = request.bids.find((b) => b.vendorId === vendorId);
    if (!ownedBid) {
      throw new Error('Only vendor owning accepted bid can mark failed delivery');
    }

    const last = await tx.deliveryTracking.findFirst({
      where: { requestId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: { status: true },
    });

    if (last?.status === 'FAILED_DELIVERY') {
      throw new Error('Delivery is already marked as failed');
    }

    const entry = await tx.deliveryTracking.create({
      data: {
        requestId,
        status: 'FAILED_DELIVERY',
        note: note || 'Delivery marked as failed by vendor',
        locationText: locationText || null,
      },
    });

    await tx.request.update({
      where: { id: requestId },
      data: { status: 'CLOSED_CANCELLED' },
    });

    await tx.notification.create({
      data: {
        userId: request.clientId,
        type: 'DELIVERY_FAILED',
        title: 'Delivery Failed',
        message: `Request #${requestId} delivery was marked as failed by vendor. Admin will review for refund.`,
      },
    });

    const admins = await tx.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });

    if (admins.length > 0) {
      await tx.notification.createMany({
        data: admins.map((a) => ({
          userId: a.id,
          type: 'DELIVERY_FAILED',
          title: 'VENDOR FAILED DELIVERY - Refund Action Required',
          message: `Vendor #${vendorId} marked Request #${requestId} as failed. Escrow funds need review.`,
        })),
      });
    }


    logger.info('notification.created', {
      event: 'delivery.failed',
      requestId,
      userId: request.clientId,
      role: 'CLIENT',
    });

    logger.info('delivery.failed.completed', {
      requestId,
      vendorId,
      trackingId: entry.id,
    });

    return entry;
  });
}
