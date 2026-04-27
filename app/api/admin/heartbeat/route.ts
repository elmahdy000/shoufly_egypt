import { NextResponse } from 'next/server';
import { getCurrentUserFromCookie } from '@/lib/auth';
import redis from '@/lib/redis';

export async function POST() {
  try {
    const user = await getCurrentUserFromCookie();
    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const key = `presence:admin:${user.id}`;
    // Mark as online for 60 seconds
    await redis.set(key, JSON.stringify({
        id: user.id,
        name: user.fullName,
        lastSeen: Date.now()
    }), 'EX', 60);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
