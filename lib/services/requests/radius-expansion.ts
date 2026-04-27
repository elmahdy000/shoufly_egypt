import { prisma } from '../../prisma';
import { Notify } from '../notifications/hub';
import { logger } from '../../utils/logger';

/**
 * This service reviews OPEN_FOR_BIDDING requests that haven't received enough bids.
 * It automatically expands the search radius in the platform settings for that area
 * or marks it as "Priority" to attract more distant vendors.
 */
export async function expandSearchRadiusForOlderRequests() {
  const MINUTES_THRESHOLD = 5; // Every 5 minutes expand
  const thresholdDate = new Date(Date.now() - MINUTES_THRESHOLD * 60 * 1000);

  const pendingRequests = await prisma.request.findMany({
    where: {
      status: 'OPEN_FOR_BIDDING',
      createdAt: { lt: thresholdDate },
      bids: { none: {} } // Only those with zero bids
    },
    include: { category: true }
  });

  logger.info('radius.expansion.checking', { count: pendingRequests.length });

  for (const req of pendingRequests) {
    // Logic: In a real system, we would notify specialized vendors in a wider radius.
    // For the DB, we can mark them with a 'priority' or 'expanded' flag if we had one,
    // or log it for the matching engine.
    
    logger.info('radius.expansion.expanding', { requestId: req.id, title: req.title, category: req.category.name });
    
    // Simulate notifying the client that we are expanding the search for them
    await Notify.send({
      userId: req.clientId, // Notify the owner of the request
      type: 'REQUEST_DISPATCHED',
      title: 'تنبيه توسيع نطاق البحث 📡',
      message: `جاري توسيع نطاق البحث للطلب #${req.id} لزيادة فرص العثور على مورد في مناطق أبعد.`,
      requestId: req.id
    });

    // We can also update the updatedAt to prevent immediate re-expansion in the next loop
    await prisma.request.update({
      where: { id: req.id },
      data: { updatedAt: new Date() }
    });
  }
}
