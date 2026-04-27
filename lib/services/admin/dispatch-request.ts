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
      governorateId: true,
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

  // Realistic Matching: Notify vendors in the same category AND same governorate
  const matchedVendors = await prisma.user.findMany({
    where: { 
      role: 'VENDOR',
      isActive: true,
      vendorCategories: { some: { categoryId: request.categoryId } },
      governorateId: request.governorateId 
    },
    select: { id: true },
  });

  if (matchedVendors.length > 0) {
    await prisma.notification.createMany({
      data: matchedVendors.map((v) => ({
        userId: v.id,
        type: 'REQUEST_DISPATCHED',
        title: 'طلب جديد بانتظار عرضك! 🛠️',
        message: `طلب رقم #${request.id} متاح الآن في قسم ${request.title} لتقديم عرض سعر.`,
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
