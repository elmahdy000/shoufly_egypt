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
        notes: 'Automatically cancelled due to inactivity (3 days).',
      },
    });

    if (expiredCount.count > 0) {
      logger.info('cron.job.expire_requests.completed', { count: expiredCount.count });
    }

    return NextResponse.json({ success: true, count: expiredCount.count });
  } catch (error: any) {
    logger.error('cron.job.expire_requests.failed', { error: error.message });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
