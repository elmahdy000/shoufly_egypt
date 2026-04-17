import redis from './redis';
import { logger } from './utils/logger';
import { createHash } from 'crypto';

/**
 * ⚡ Shoofly Edge Cache
 * Managed wrapper for Redis with automatic fallbacks and logging.
 */
export const Cache = {
  /**
   * Get data from cache or fetch from DB and store it
   */
  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttlSeconds: number = 3600): Promise<T> {
    try {
      // 1. Try to get from Redis
      const cachedData = await redis.get(key);
      if (cachedData) {
        logger.info('cache.hit', { key });
        return JSON.parse(cachedData) as T;
      }
    } catch (err) {
      logger.error('cache.error', { key, error: (err as Error).message });
    }

    // 2. Cache Miss: Fetch from DB
    logger.info('cache.miss', { key });
    const freshData = await fetcher();

    // 3. Store back in Redis for next time
    try {
      if (freshData) {
        await redis.set(key, JSON.stringify(freshData), 'EX', ttlSeconds);
      }
    } catch (err) {
      logger.error('cache.set.error', { key, error: (err as Error).message });
    }

    return freshData;
  },

  /**
   * Invalidate a cache key (e.g. when data updates)
   */
  async invalidate(key: string) {
    logger.info('cache.invalidate', { key });
    await redis.del(key);
  }
};

export const cache = {
  async get<T = string>(key: string): Promise<T | null> {
    try {
      return (await redis.get(key)) as T | null;
    } catch (err) {
      logger.error('cache.get.error', { key, error: (err as Error).message });
      return null;
    }
  },

  async set(key: string, value: string, ttlSeconds: number = 3600): Promise<void> {
    try {
      await redis.set(key, value, 'EX', ttlSeconds);
    } catch (err) {
      logger.error('cache.set.error', { key, error: (err as Error).message });
    }
  },

  async deletePattern(pattern: string): Promise<number> {
    try {
      const redisAny = redis as any;
      if (typeof redisAny.keys !== 'function') {
        return 0;
      }

      const keys: string[] = await redisAny.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }

      return await redis.del(...keys);
    } catch (err) {
      logger.error('cache.deletePattern.error', { pattern, error: (err as Error).message });
      return 0;
    }
  },
};

export function generateCacheKey(prefix: string, params: Record<string, unknown>): string {
  const sorted = Object.keys(params)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});

  const hash = createHash('sha1').update(JSON.stringify(sorted)).digest('hex');
  return `${prefix}:${hash}`;
}

export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 3600
): Promise<T> {
  const cached = await cache.get(key);
  if (cached) {
    try {
      return JSON.parse(cached) as T;
    } catch {
      return cached as T;
    }
  }

  const fresh = await fetcher();
  if (fresh !== undefined && fresh !== null) {
    await cache.set(key, JSON.stringify(fresh), ttlSeconds);
  }
  return fresh;
}
