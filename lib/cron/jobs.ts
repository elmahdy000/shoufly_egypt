import { prisma } from '../prisma';
import { logger } from '../utils/logger';
import { subDays } from 'date-fns';

/**
 * 🧹 Production Cleanup Jobs
 * These tasks keep the database healthy and performant.
 */

export async function cleanupOldNotifications() {
  const thirtyDaysAgo = subDays(new Date(), 30);
  
  try {
    const deleted = await prisma.notification.deleteMany({
      where: {
        createdAt: { lt: thirtyDaysAgo },
        isRead: true, // Only delete read ones to be safe
      },
    });
    
    logger.info('cron.cleanup.notifications', { count: deleted.count });
  } catch (err) {
    logger.error('cron.cleanup.notifications.failed', { error: String(err) });
  }
}

export async function expireOldRequests() {
  const sevenDaysAgo = subDays(new Date(), 7);
  
  try {
    const expired = await prisma.request.updateMany({
      where: {
        status: { in: ['PENDING_ADMIN_REVISION', 'OPEN_FOR_BIDDING'] },
        createdAt: { lt: sevenDaysAgo },
      },
      data: { status: 'CLOSED_CANCELLED' },
    });
    
    logger.info('cron.cleanup.stale_requests', { count: expired.count });
  } catch (err) {
    logger.error('cron.cleanup.stale_requests.failed', { error: String(err) });
  }
}

export async function checkSystemHealth() {
    // Basic verification logic can go here
    logger.info('cron.health_check.heartbeat', { ts: new Date().toISOString() });
}
