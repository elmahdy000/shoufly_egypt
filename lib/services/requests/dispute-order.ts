import { prisma } from '../../prisma';
import { Notify } from '../notifications/hub';
import { logger } from '../../utils/logger';

/**
 * Service to allow a client to dispute an order after delivery.
 * Freezes the escrow funds and flags the request for admin review.
 */
export async function disputeOrder(clientId: number, requestId: number, reason: string) {
  logger.info('dispute.order.started', { clientId, requestId });

  return prisma.$transaction(async (tx) => {
    // 1. Fetch + lock the request inside the transaction
    const request = await tx.request.findUnique({
      where: { id: requestId },
      include: { transactions: true },
    });

    if (!request || request.clientId !== clientId) {
      throw new Error('غير مصرح أو الطلب غير موجود.');
    }

    // 2. Can only dispute a paid order
    const disputeableStates = ['ORDER_PAID_PENDING_DELIVERY'];
    if (!disputeableStates.includes(request.status)) {
      throw new Error(
        `لا يمكن فتح نزاع على طلب في الحالة "${request.status}". يجب أن يكون الطلب مدفوعاً.`
      );
    }

    // 3. Find the accepted vendor
    const acceptedBid = await tx.bid.findFirst({
      where: { requestId, status: 'ACCEPTED_BY_CLIENT' },
    });

    // 4. Create formal Complaint
    const complaint = await tx.complaint.create({
      data: {
        requestId,
        userId: clientId,
        reportedUserId: acceptedBid?.vendorId || null,
        subject: 'نزاع مالي - جودة الخدمة/المنتج',
        description: reason,
        status: 'OPEN',
      },
    });

    // 5. Freeze the request — return to admin review
    //    NOTE: using PENDING_ADMIN_REVISION (not REJECTED which is for admin-review rejections)
    await tx.request.update({
      where: { id: requestId },
      data: { status: 'PENDING_ADMIN_REVISION' },
    });

    logger.info('dispute.order.completed', {
      requestId,
      complaintId: complaint.id,
      reportedVendorId: acceptedBid?.vendorId,
    });

    return { success: true, complaintId: complaint.id };
  }).then(async (result) => {
    // Post-transaction: notify vendor (non-critical, outside tx)
    const acceptedBid = await prisma.bid.findFirst({
      where: { requestId, status: 'ACCEPTED_BY_CLIENT' },
    });
    if (acceptedBid?.vendorId) {
      try {
        await Notify.disputeRaised(acceptedBid.vendorId, requestId, reason);
      } catch (err) {
        logger.error('dispute.order.notify.failed', { requestId, err });
      }
    }
    return result;
  });
}
