/**
 * API Route Optimizations
 * Caching, compression, and response optimization
 */

import { NextRequest, NextResponse } from 'next/server';
import { cache, withCache, generateCacheKey } from './cache';

/**
 * Cache middleware for API routes
 */
export function withAPCache(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: {
    ttl?: number; // seconds
    keyGenerator?: (req: NextRequest) => string;
  } = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return handler(req);
    }

    const cacheKey = options.keyGenerator 
      ? options.keyGenerator(req)
      : generateCacheKey('api', {
          url: req.url,
          user: req.headers.get('cookie')?.includes('session_token') ? 'auth' : 'anon',
        });

    // Try to get from cache
    const cached = await cache.get<string>(cacheKey);
    
    if (cached) {
      return new NextResponse(cached, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'HIT',
        },
      });
    }

    // Execute handler
    const response = await handler(req);
    
    // Cache the response if successful
    if (response.status === 200) {
      const cloned = response.clone();
      const body = await cloned.text();
      cache.set(cacheKey, body, options.ttl || 60);
    }

    // Add cache header
    const newHeaders = new Headers(response.headers);
    newHeaders.set('X-Cache', 'MISS');
    
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  };
}

/**
 * JSON response with compression hint
 */
export function jsonResponse(data: any, status: number = 200, cacheControl?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (cacheControl) {
    headers['Cache-Control'] = cacheControl;
  }

  // Next.js handles compression (gzip/brotli) automatically at the platform level.
  // Manually setting the header without compressing the body will break the response.
  return NextResponse.json(data, { status, headers });
}

/**
 * Optimized error response
 */
export function errorResponse(message: string, status: number = 400, details?: any) {
  return NextResponse.json(
    { 
      error: message, 
      ...(details && { details }),
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Rate limiting helper (simple in-memory)
 */
class SimpleRateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 60000 // 1 minute
  ) {}

  isAllowed(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Get existing requests
    const timestamps = this.requests.get(key) || [];
    
    // Filter to current window
    const validTimestamps = timestamps.filter(t => t > windowStart);
    
    // Check if under limit
    if (validTimestamps.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    
    return true;
  }

  getRemaining(key: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const timestamps = this.requests.get(key) || [];
    const validTimestamps = timestamps.filter(t => t > windowStart);
    
    return Math.max(0, this.maxRequests - validTimestamps.length);
  }
}

export const rateLimiter = new SimpleRateLimiter();

/**
 * Rate limit middleware
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: {
    maxRequests?: number;
    windowMs?: number;
    keyGenerator?: (req: NextRequest) => string;
  } = {}
) {
  const limiter = new SimpleRateLimiter(options.maxRequests || 100, options.windowMs || 60000);
  
  return async (req: NextRequest): Promise<NextResponse> => {
    const key = options.keyGenerator 
      ? options.keyGenerator(req)
      : req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    if (!limiter.isAllowed(key)) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((options.windowMs || 60000) / 1000),
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'Retry-After': String(Math.ceil((options.windowMs || 60000) / 1000)),
          }
        }
      );
    }

    const response = await handler(req);
    
    // Add rate limit headers
    const newHeaders = new Headers(response.headers);
    newHeaders.set('X-RateLimit-Remaining', String(limiter.getRemaining(key)));
    
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  };
}

/**
 * Optimize database query with automatic caching
 */
export async function optimizedQuery<T>(
  queryFn: () => Promise<T>,
  cacheKey: string,
  ttlSeconds: number = 60
): Promise<T> {
  return withCache(cacheKey, queryFn, ttlSeconds);
}

/**
 * Batch invalidate cache tags
 */
export function invalidateRelatedCache(tags: string[]) {
  for (const tag of tags) {
    cache.deletePattern(`*${tag}*`);
  }
  
  console.log(`[Cache] Invalidated tags: ${tags.join(', ')}`);
}

/**
 * Response time tracking
 */
export function trackResponseTime(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const start = performance.now();
    
    const response = await handler(req);
    
    const duration = performance.now() - start;
    
    // Log slow requests (> 1 second)
    if (duration > 1000) {
      console.warn(`[Slow Request] ${req.url} took ${duration.toFixed(2)}ms`);
    }
    
    const newHeaders = new Headers(response.headers);
    newHeaders.set('X-Response-Time', `${duration.toFixed(2)}ms`);
    
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  };
}
