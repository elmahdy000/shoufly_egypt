import { Redis } from 'ioredis';

/**
 * 🚀 High-Availability Redis Client with Singleton Pattern
 * Prevents multiple connections during Next.js Hot Module Replacement (HMR).
 */

const MOCK_STORAGE = new Map<string, string>();

let _isRedisAvailable = process.env.NODE_ENV === 'test';

export const isRedisAvailable = () => _isRedisAvailable;

class MockRedis {
  status = 'ready';

  async get(key: string) { return MOCK_STORAGE.get(key) || null; }
  async set(key: string, value: string, mode?: string, duration?: number) {
    MOCK_STORAGE.set(key, value);
    if (mode === 'EX' && duration) {
      setTimeout(() => MOCK_STORAGE.delete(key), duration * 1000);
    }
    return 'OK';
  }
  async del(...keys: string[]) {
    let deleted = 0;
    for (const key of keys) {
      if (MOCK_STORAGE.delete(key)) deleted++;
    }
    return deleted;
  }
  async incr(key: string) {
    const val = parseInt(MOCK_STORAGE.get(key) || '0') + 1;
    MOCK_STORAGE.set(key, val.toString());
    return val;
  }
  async expire(key: string, seconds: number) {
    setTimeout(() => MOCK_STORAGE.delete(key), seconds * 1000);
    return 1;
  }
  async ttl(key: string) { return 60; }
  
  // Sorted Set Mocks
  async zadd(key: string, score: number, member: string) { return 1; }
  async zremrangebyscore(key: string, min: number, max: number) { return 1; }
  async zcard(key: string) { return 0; }
  async zrange(key: string, start: number, stop: number, withScores?: string) { return []; }
  
  // Pub/Sub Mocks
  async publish(channel: string, message: string) { return 0; }
  async subscribe(...channels: string[]) { return; }
  async unsubscribe(...channels: string[]) { return; }

  async keys(pattern: string) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return Array.from(MOCK_STORAGE.keys()).filter(k => regex.test(k));
  }

  async quit() { return 'OK'; }
  on() { return this; }
  once() { return this; }
  disconnect() {}
}

// 🛡️ TypeScript Global Declaration
declare global {
  var redis: Redis | MockRedis | undefined;
}

let currentClient: any;

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const createRealClient = (options = {}) => {
  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 0,
    connectTimeout: 2000,
    lazyConnect: true,
    ...options
  });
  
  client.on('error', (err) => {
    if (!(currentClient instanceof MockRedis)) {
        console.warn(`⚠️ Redis Connection Error: ${err.message}. Using in-memory fallback.`);
        currentClient = new MockRedis();
        _isRedisAvailable = false;
    }
  });

  return client;
};

// Use existing global instance if available, otherwise create new
currentClient = global.redis || (process.env.NODE_ENV === 'test' ? new MockRedis() : createRealClient());
_isRedisAvailable = !(currentClient instanceof MockRedis);

/**
 * 🛡️ The Ultimate Redis Proxy
 */
const redisProxy = new Proxy({} as any, {
  get(_, prop) {
    const callTarget = currentClient;
    
    // If the property is not a function, return it directly (e.g., status)
    if (typeof callTarget[prop] !== 'function') {
      return callTarget[prop];
    }

    // Return a wrapper for methods
    return async (...args: any[]) => {
      try {
        // Refresh callTarget inside the async call in case of failover
        return await currentClient[prop].apply(currentClient, args);
      } catch (err) {
        if (!(currentClient instanceof MockRedis)) {
          console.error('❌ Redis failover triggered during:', prop);
          currentClient = new MockRedis();
          _isRedisAvailable = false;
        }
        
        const mockTarget = currentClient;
        if (typeof mockTarget[prop] === 'function') {
          return await mockTarget[prop].apply(mockTarget, args);
        }
        return null;
      }
    };
  }
});

// Save to global in development
if (process.env.NODE_ENV !== 'production') {
  global.redis = currentClient;
}

export const getRedisClient = () => redisProxy;

/**
 * Creates a dedicated subscriber client (since ioredis blocks the main client)
 */
export const createSubscriberClient = () => {
  if (!isRedisAvailable()) return new MockRedis();
  return createRealClient({ maxRetriesPerRequest: null });
};

export default redisProxy;
