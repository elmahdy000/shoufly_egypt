/**
 * Simple in-memory rate limiter for API routes
 * In production, use Redis for distributed rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Check if request is within rate limit
 * @param key - Unique identifier (IP + route or userId)
 * @param maxRequests - Max requests allowed in window
 * @param windowMs - Time window in milliseconds
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 5,
  windowMs: number = 60000 // 1 minute default
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  // Clean up old entries periodically (simple cleanup)
  if (rateLimitMap.size > 10000) {
    const keysToDelete: string[] = [];
    rateLimitMap.forEach((entry, k) => {
      if (entry.resetTime < now) {
        keysToDelete.push(k);
      }
    });
    keysToDelete.forEach(k => rateLimitMap.delete(k));
  }

  if (!entry || entry.resetTime < now) {
    // New window
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitMap.set(key, newEntry);
    return {
      allowed: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetTime: newEntry.resetTime,
    };
  }

  // Existing window
  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  entry.count++;
  return {
    allowed: true,
    limit: maxRequests,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get client IP from request headers
 */
export function getClientIP(headers: Headers): string {
  // Try various headers for IP
  const forwarded = headers.get('x-forwarded-for');
  const realIP = headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}
