import { Redis } from 'ioredis';

/**
 * 🚀 High-Availability Redis Client with Singleton Pattern
 * Prevents multiple connections during Next.js Hot Module Replacement (HMR).
 */

const MOCK_STORAGE = new Map<string, string>();

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
  async del(key: string) { return MOCK_STORAGE.delete(key) ? 1 : 0; }
  async exists(key: string) { return MOCK_STORAGE.has(key) ? 1 : 0; }
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

const createRealClient = () => {
  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 0,
    connectTimeout: 1000,
    lazyConnect: true,
  });
  
  client.on('error', () => {
    if (!(currentClient instanceof MockRedis)) {
        console.warn('⚠️ Redis unreachable, using in-memory fallback.');
        currentClient = new MockRedis();
    }
  });

  return client;
};

// Use existing global instance if available, otherwise create new
currentClient = global.redis || (process.env.NODE_ENV === 'test' ? new MockRedis() : createRealClient());

/**
 * 🛡️ The Ultimate Redis Proxy
 */
const redisProxy = new Proxy({} as any, {
  get(_, prop) {
    return async (...args: any[]) => {
      let callTarget = currentClient;
      try {
        if (typeof callTarget[prop] !== 'function') return undefined;
        return await callTarget[prop].apply(callTarget, args);
      } catch (err) {
        if (!(currentClient instanceof MockRedis)) {
          console.error('❌ Redis failover triggered during:', prop);
          currentClient = new MockRedis();
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
export default redisProxy;
