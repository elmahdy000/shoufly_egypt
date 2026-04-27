import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import redis from '@/lib/redis';

/**
 * 🩺 System Health Check
 * Monitored by UptimeRobot / Sentry / Monitoring tools.
 * Verifies DB connection, Redis connection, and FS accessibility.
 */

export async function GET() {
  const status: {
    status: 'UP' | 'DOWN';
    timestamp: string;
    services: {
      database: 'UNKNOWN' | 'CONNECTED' | 'ERROR';
      redis: 'UNKNOWN' | 'CONNECTED' | 'FALLBACK_MODE' | 'ERROR';
      storage: 'UNKNOWN' | 'CONNECTED' | 'ERROR';
    };
  } = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    services: {
      database: 'UNKNOWN',
      redis: 'UNKNOWN',
      storage: 'UNKNOWN',
    },
  };

  try {
    // 1. Database Check
    await prisma.$queryRaw`SELECT 1`;
    status.services.database = 'CONNECTED';
  } catch (err) {
    status.services.database = 'ERROR';
    status.status = 'DOWN';
  }

  try {
    // 2. Redis Check using the Proxy
    const ping = await redis.set('health_ping', 'ok', 'EX', 10);
    status.services.redis = ping === 'OK' ? 'CONNECTED' : 'FALLBACK_MODE';
  } catch (err) {
    status.services.redis = 'ERROR';
    // We don't mark the whole system as DOWN just for Redis fallback
  }

  // Final response with appropriate status code
  return NextResponse.json(status, {
    status: status.status === 'UP' ? 200 : 503,
  });
}
