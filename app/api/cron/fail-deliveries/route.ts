import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

export async function GET(request: Request) {
  // Verify authorization
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

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
            createdAt: { lt: twoDaysAgo },
          },
        },
      },
    });

    for (const req of stuckRequests) {
      await prisma.deliveryTracking.create({
        data: {
          requestId: req.id,
          status: 'FAILED_DELIVERY',
          note: 'Automatically marked failed due to agent timeout.',
        },
      });
    }

    if (stuckRequests.length > 0) {
      logger.info('cron.job.fail_deliveries.completed', { count: stuckRequests.length });
    }

    return NextResponse.json({ success: true, count: stuckRequests.length });
  } catch (error: any) {
    logger.error('cron.job.fail_deliveries.failed', { error: error.message });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
