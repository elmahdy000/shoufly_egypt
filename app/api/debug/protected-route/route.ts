import { NextRequest, NextResponse } from 'next/server';
import { RateLimiter } from '@/lib/rate-limiter';

export async function GET(req: NextRequest) {
  // Use IP as key for rate limiting
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  
  // Limit: 5 requests per 10 seconds for this debug route
  const { allowed, remaining, reset } = await RateLimiter.check(`debug:${ip}`, 5, 10);

  if (!allowed) {
    return NextResponse.json(
        { error: 'Too Many Requests', retryAfter: reset }, 
        { status: 429, headers: { 'Retry-After': reset.toString() } }
    );
  }

  return NextResponse.json({ 
    message: 'Access Granted! Shoofly Armor is watching.',
    remaining 
  });
}
