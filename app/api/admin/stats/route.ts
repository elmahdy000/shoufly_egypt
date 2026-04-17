import { NextRequest, NextResponse } from 'next/server';
import { getPlatformStats } from '@/lib/services/admin/get-platform-stats';
import { getCurrentUser, requireUser, requireRole } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);
    requireRole(user, 'ADMIN');

    const stats = await getPlatformStats();
    return NextResponse.json(stats);
  } catch (err) {
    console.error('Failed to fetch platform stats:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
