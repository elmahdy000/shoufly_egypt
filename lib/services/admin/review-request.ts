import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

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
      await prisma.notification.createMany({
        data: vendors.map((v: { id: number }) => ({
          userId: v.id,

          type: 'NEW_REQUEST',
          title: 'New Bid Opportunity',
          message: `A new request in ${updated.category.name} is open for bidding.`,
        })),
      });

      logger.info('notification.created', {
        event: 'request.opened',
        requestId,
        vendorCount: vendors.length,
      });
    }
  }

  logger.info('request.review.completed', {

    requestId,
    action,
    newStatus: updated.status,
  });

  return updated;
}
