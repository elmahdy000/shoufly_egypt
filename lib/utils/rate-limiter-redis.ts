/**
 * Redis-based Distributed Rate Limiter
 * Production-ready rate limiting with Redis backend
 */

import { getRedisClient } from '@/lib/redis';

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Redis-based rate limit check
 * Uses sliding window algorithm for accurate rate limiting
 */
export async function checkRateLimitRedis(
  key: string,
  maxRequests: number = 5,
  windowMs: number = 60000 // 1 minute default
): Promise<RateLimitResult> {
  const redis = getRedisClient();
  const now = Date.now();
  const windowStart = now - windowMs;
  
  const redisKey = `ratelimit:${key}`;
  
  try {
    // Use Redis sorted set for sliding window
    // Remove old entries outside the window
    await redis.zremrangebyscore(redisKey, 0, windowStart);
    
    // Count current requests in window
    const currentCount = await redis.zcard(redisKey);
    
    if (currentCount >= maxRequests) {
      // Get the oldest request to calculate reset time
      const oldestRequests = await redis.zrange(redisKey, 0, 0, 'WITHSCORES');
      const oldestTimestamp = parseInt(oldestRequests[1] || '0');
      const resetTime = oldestTimestamp + windowMs;
      
      return {
        allowed: false,
        limit: maxRequests,
        remaining: 0,
        resetTime,
      };
    }
    
    // Add current request
    await redis.zadd(redisKey, now, `${now}-${Math.random()}`);
    
    // Set expiry on the key to auto-cleanup
    await redis.expire(redisKey, Math.ceil(windowMs / 1000));
    
    const remaining = maxRequests - currentCount - 1;
    const resetTime = now + windowMs;
    
    return {
      allowed: true,
      limit: maxRequests,
      remaining: Math.max(0, remaining),
      resetTime,
    };
    
  } catch (error) {
    console.error('Redis rate limit error:', error);
    
    // Fail closed - deny request if Redis is down for security
    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      resetTime: now + windowMs,
    };
  }
}

/**
 * Get client IP from request headers
 * Supports various proxy configurations
 */
export function getClientIP(headers: Headers): string {
  // Try various headers for IP
  const forwarded = headers.get('x-forwarded-for');
  const realIP = headers.get('x-real-ip');
  const cfIP = headers.get('cf-connecting-ip'); // Cloudflare
  
  if (cfIP) {
    return cfIP.trim();
  }
  
  if (forwarded) {
    // Get first IP in chain (client IP)
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP.trim();
  }
  
  return 'unknown';
}

/**
 * Get rate limit info without consuming a request
 */
export async function getRateLimitInfo(
  key: string,
  maxRequests: number = 5,
  windowMs: number = 60000
): Promise<RateLimitResult> {
  const redis = getRedisClient();
  const now = Date.now();
  const windowStart = now - windowMs;
  
  const redisKey = `ratelimit:${key}`;
  
  try {
    // Remove old entries
    await redis.zremrangebyscore(redisKey, 0, windowStart);
    
    // Count current requests
    const currentCount = await redis.zcard(redisKey);
    
    // Get oldest request for reset time
    const oldestRequests = await redis.zrange(redisKey, 0, 0, 'WITHSCORES');
    const oldestTimestamp = parseInt(oldestRequests[1] || '0');
    const resetTime = currentCount > 0 ? oldestTimestamp + windowMs : now + windowMs;
    
    const remaining = Math.max(0, maxRequests - currentCount);
    
    return {
      allowed: remaining > 0,
      limit: maxRequests,
      remaining,
      resetTime,
    };
    
  } catch (error) {
    console.error('Redis rate limit info error:', error);
    
    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      resetTime: now + windowMs,
    };
  }
}

/**
 * Reset rate limit for a key
 * Useful for testing or manual reset
 */
export async function resetRateLimit(key: string): Promise<void> {
  const redis = getRedisClient();
  await redis.del(`ratelimit:${key}`);
}
