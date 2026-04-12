import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

/**
 * Dispatch request to visible vendors
 * For Level 3, this is simplified - just marks request as visible
 * In production, would filter by location, categories, etc.
 */
export async function dispatchRequest(requestId: number) {
  logger.info('request.dispatch.started', { requestId });
  const request = await prisma.request.findUnique({
    where: { id: requestId },
    select: {
      id: true,
      categoryId: true,
      status: true,
      title: true,
    },
  });

  if (!request) {
    throw new Error('Request not found');
  }

  if (request.status !== 'OPEN_FOR_BIDDING') {
    throw new Error(`Request must be in OPEN_FOR_BIDDING status to dispatch`);
  }

  const matchedVendors = await prisma.vendorCategory.findMany({
    where: { categoryId: request.categoryId },
    select: { vendorId: true },
  });

  if (matchedVendors.length > 0) {
    await prisma.notification.createMany({
      data: matchedVendors.map((v) => ({
        userId: v.vendorId,
        type: 'REQUEST_DISPATCHED',
        title: 'Request Dispatched',
        message: `Request #${request.id} is now open for bidding.`,
      })),
    });
    logger.info('notification.created', {
      event: 'request.dispatch',
      requestId,
      recipients: matchedVendors.length,
      role: 'VENDOR',
    });
  }

  logger.info('request.dispatch.completed', {
    requestId,
    matchedVendors: matchedVendors.length,
  });

  return request;
}
