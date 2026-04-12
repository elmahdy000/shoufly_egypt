import cron from 'node-cron';
import { prisma } from '../prisma';
import { logger } from '../utils/logger';

export function initCronJobs() {
    logger.info('system.cron.initializing', { status: 'starting' });

    // 1. Expire outdated open requests (Runs every hour)
    // If a request is OPEN_FOR_BIDDING for more than 3 days
    cron.schedule('0 * * * *', async () => {
        try {
            logger.info('cron.job.expire_requests.running');
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

            const expiredCount = await prisma.request.updateMany({
                where: {
                    status: 'OPEN_FOR_BIDDING',
                    createdAt: { lt: threeDaysAgo },
                },
                data: {
                    status: 'CLOSED_CANCELLED',
                    notes: 'Automatically cancelled due to inactivity (3 days).'
                }
            });

            if (expiredCount.count > 0) {
                logger.info('cron.job.expire_requests.completed', { count: expiredCount.count });
            }
        } catch (error) {
           logger.error('cron.job.expire_requests.failed', { error });
        }
    });

    // 2. Clear abandoned deliveries (Runs every day at midnight)
    // Agent did not complete a delivery marked OUT_FOR_DELIVERY within 2 days
    cron.schedule('0 0 * * *', async () => {
        try {
            logger.info('cron.job.fail_deliveries.running');
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

            // Fetch requests to process failed deliveries
            const stuckRequests = await prisma.request.findMany({
                where: {
                    status: 'ORDER_PAID_PENDING_DELIVERY',
                    assignedDeliveryAgentId: { not: null },
                    deliveryTracking: {
                        some: {
                            status: 'OUT_FOR_DELIVERY',
                            createdAt: { lt: twoDaysAgo }
                        }
                    }
                }
            });

            for(const req of stuckRequests) {
                await prisma.deliveryTracking.create({
                    data: {
                        requestId: req.id,
                        status: 'FAILED_DELIVERY',
                        note: 'Automatically marked failed due to agent timeout.'
                    }
                });
                
                // You can add logic to alert admins or penalize agents here
            }

            if (stuckRequests.length > 0) {
                 logger.info('cron.job.fail_deliveries.completed', { count: stuckRequests.length });
            }

        } catch (error) {
            logger.error('cron.job.fail_deliveries.failed', { error });
        }
    });

    logger.info('system.cron.initialized', { status: 'success' });
}
