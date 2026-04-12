import { NextRequest } from 'next/server';
import { getCurrentUser, requireRole, requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { fail, ok } from '@/lib/utils/http-response';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'ADMIN');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      dispatchedToday,
      rejectedToday,
      pendingReview,
      totalRequests
    ] = await Promise.all([
      // Dispatched today
      prisma.request.count({
        where: {
          status: 'DISPATCHED',
          updatedAt: { gte: today }
        }
      }),
      // Rejected today
      prisma.request.count({
        where: {
          status: 'REJECTED',
          updatedAt: { gte: today }
        }
      }),
      // Pending review
      prisma.request.count({
        where: {
          status: 'PENDING_ADMIN_REVISION'
        }
      }),
      // Total requests
      prisma.request.count()
    ]);

    return ok({
      dispatchedToday,
      rejectedToday,
      pendingReview,
      totalRequests
    });

  } catch (error) {
    console.error('Requests stats API error:', error);
    return fail(error);
  }
}
