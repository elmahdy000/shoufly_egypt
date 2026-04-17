import redis from './redis';
import { logger } from './utils/logger';

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
