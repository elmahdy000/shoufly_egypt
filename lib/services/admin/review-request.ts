import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import { Notify } from '../notifications/hub';

type ReviewAction = 'approve' | 'reject';

export async function reviewRequest(requestId: number, action: ReviewAction) {
  logger.info('request.review.started', { requestId, action });
  const request = await prisma.request.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new Error('Request not found');
  }

  if (request.status !== 'PENDING_ADMIN_REVISION') {
    throw new Error(`Request is in status ${request.status}, cannot review`);
  }

  const newStatus =
    action === 'approve' ? 'OPEN_FOR_BIDDING' : 'REJECTED';

  const updated = await prisma.request.update({
    where: { id: requestId },
    data: { status: newStatus },
    include: { category: true, client: true },
  });

  if (action === 'approve') {
    // Notify all vendors in this category
    const vendors = await prisma.user.findMany({
      where: {
        role: 'VENDOR',
        isActive: true,
        vendorCategories: {
          some: { categoryId: updated.categoryId },
        },
      },
      select: { id: true },
    });

    if (vendors.length > 0) {
      for (const v of vendors) {
        await Notify.send({
          userId: v.id,
          type: 'NEW_REQUEST',
          title: 'فرصة عمل جديدة! 🛠️',
          message: `يوجد طلب جديد في قسم ${updated.category.name} بانتظار عروضك.`,
        });
      }

      logger.info('notification.created', {
        event: 'request.opened',
        requestId,
        vendorCount: vendors.length,
      });
    }
  } else {
    // Notify client of rejection
    await Notify.requestRejected(updated.clientId, requestId, updated.title);
  }

  logger.info('request.review.completed', {

    requestId,
    action,
    newStatus: updated.status,
  });

  return updated;
}
