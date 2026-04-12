import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireUser, requireRole } from '@/lib/auth';
import { getAdminStats } from '@/lib/services/analytics/get-admin-stats';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'ADMIN');

    const stats = await getAdminStats();

    return NextResponse.json(stats);

  } catch (error: any) {
    const status = error.message === 'Unauthorized' ? 401 : 403;
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: error.message.includes('Forbidden') ? 403 : status }
    );
  }
}
