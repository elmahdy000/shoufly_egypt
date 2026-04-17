import redis from './redis';
import { logger } from './utils/logger';

/**
 * 🛡️ Shoofly Armor: API Rate Limiter
 * Uses Redis Fixed-Window algorithm to protect endpoints.
 */
export const RateLimiter = {
  /**
   * Check if a user/IP has exceeded their quota
   */
  async check(key: string, limit: number, windowSeconds: number): Promise<{ 
    allowed: boolean; 
    remaining: number; 
    reset: number; 
  }> {
    const fullKey = `ratelimit:${key}`;
    
    try {
      const current = await redis.get(fullKey);
      const currentCount = current ? parseInt(current) : 0;

      // 1. Increment Count (Atomic in Redis)
      const newCount = await redis.incr(fullKey);

      // 2. Set Expiry on the first request of the window
      if (newCount === 1) {
          await redis.expire(fullKey, windowSeconds);
      }

      if (newCount > limit) {
        const ttl = await redis.ttl(fullKey);
        logger.warn('security.ratelimit.exceeded', { key, limit, ttl });
        return { allowed: false, remaining: 0, reset: ttl };
      }

      return { 
        allowed: true, 
        remaining: limit - newCount, 
        reset: await redis.ttl(fullKey) 
      };

    } catch (err) {
      logger.error('security.ratelimit.error', { key, error: (err as Error).message });
      // In case of Redis error, fail open to not block users, but log it
      return { allowed: true, remaining: 1, reset: 0 };
    }
  }
};
