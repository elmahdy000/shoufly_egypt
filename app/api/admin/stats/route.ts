import { NextRequest, NextResponse } from 'next/server';
import { getPlatformStats } from '@/lib/services/admin/get-platform-stats';
import { getCurrentUser, requireUser, requireRole } from '@/lib/auth';
import { createErrorResponse, logError } from '@/lib/utils/error-handler';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'ADMIN');

    const stats = await getPlatformStats();
    return NextResponse.json(stats);
  } catch (err) {
    logError('ADMIN_STATS', err);
    const { response, status } = createErrorResponse(err);
    return NextResponse.json(response, { status });
  }
}
