import { NextResponse } from 'next/server';
import { getPlatformStats } from '@/lib/services/admin/get-platform-stats';
import { getCurrentUserFromCookie } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUserFromCookie();
    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getPlatformStats();
    return NextResponse.json(stats);
  } catch (err) {
    console.error('Failed to fetch platform stats:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
