import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { createNotification } from '../notifications/create-notification';
import { NotificationType } from '@/app/generated/prisma';

export async function cancelRequest(params: {
  requestId: number;
  userId: number;
  role: string;
}) {
  const { requestId, userId, role } = params;
  logger.info('request.cancel.started', { requestId, userId, role });

  return prisma.$transaction(async (tx) => {
    const request = await tx.request.findUnique({
      where: { id: requestId },
      include: {
        deliveryTracking: {
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          take: 1,
          select: { status: true },
        },
        bids: {
          select: {
            vendorId: true,
          },
        },
      },
    });

    if (!request) {
      throw new Error('Request not found');
    }

    // Security: Only client (owner) or Admin can cancel
    if (role !== 'ADMIN' && request.clientId !== userId) {
      throw new Error('Unauthorized to cancel this request');
    }

    // Business Logic: Can only cancel if not yet paid/settled
    const cancellableStates = ['PENDING_ADMIN_REVISION', 'OPEN_FOR_BIDDING', 'BIDS_RECEIVED', 'OFFERS_FORWARDED'];
    if (!cancellableStates.includes(request.status)) {
      throw new Error(`Cannot cancel request in status ${request.status}. Please contact support for refunds if already paid.`);
    }

    // SECURITY: Prevent cancellation if vendor has started preparing (ORDER_PLACED or later)
    const vendorStartedPreparing = request.deliveryTracking.some(
      (t) => t.status === 'ORDER_PLACED' || t.status === 'VENDOR_PREPARING' || t.status === 'READY_FOR_PICKUP'
    );
    if (vendorStartedPreparing) {
      throw new Error('Cannot cancel - vendor has already started preparing the order');
    }

    const updated = await tx.request.update({
      where: { id: requestId },
      data: { status: 'CLOSED_CANCELLED' },
    });

    // Notify all vendors who participated
    const vendorIds = Array.from(new Set(request.bids.map((b) => b.vendorId)));
    
    // We do notifications outside the transaction return or as a background task
    // but here we can just loop and use the service.
    // Note: createNotification is async and uses prisma directly.
    // To be safe and transactional, we should ideally have a tx-compatible createNotification,
    // but for now, we'll trigger them after the transaction successfully completes.
    
    // We'll return the updated request and the list of vendors to notify
    return { updated, vendorIds };
  }).then(async ({ updated, vendorIds }) => {
    // Post-transaction notifications
    for (const vendorId of vendorIds) {
      try {
        await createNotification({
          userId: vendorId,
          type: NotificationType.REQUEST_CANCELLED,
          title: 'طلب ملغي',
          message: `تم إلغاء الطلب رقم #${requestId} من قبل العميل.`,
          requestId,
        });
      } catch (err) {
        logger.error('request.cancel.notification.failed', { vendorId, requestId, err });
      }
    }

    logger.info('request.cancel.completed', { requestId, userId });
    return updated;
  });
}
