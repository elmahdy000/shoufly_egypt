import { Redis } from "ioredis";

/**
 * 🚀 MockRedis: In-Memory fallback for development
 * Ensures the app works even if Redis is not installed/running locally.
 */
class MockRedis {
  private storage = new Map<string, string>();
  status = "ready";

  async get(key: string) {
    return this.storage.get(key) || null;
  }

  async set(key: string, value: string, mode?: string, duration?: number) {
    this.storage.set(key, value);
    if (mode === "EX" && duration) {
      setTimeout(() => this.storage.delete(key), duration * 1000);
    }
    return "OK";
  }

  async del(key: string) {
    this.storage.delete(key);
    return 1;
  }

  async keys(pattern: string) {
    const regex = new RegExp(pattern.replace("*", ".*"));
    return Array.from(this.storage.keys()).filter((k) => regex.test(k));
  }

  async zremrangebyscore(key: string, min: any, max: any) { return 0; }
  async zcard(key: string) { return 0; }
  async zrange(key: string, min: any, max: any, mode?: string) { return []; }
  async zadd(key: string, score: number, member: string) { return 1; }
  async expire(key: string, seconds: number) { return 1; }

  async quit() {
    return "OK";
  }

  on() { return this; }
  disconnect() {}
}

const redis = (() => {
  if (process.env.NODE_ENV === "test") return new MockRedis() as any;

  try {
    const client = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        if (times > 1) {
          console.warn("⚠️ Redis connection failed. Falling back to MockRedis.");
          return null; // Stop retrying to trigger fallback
        }
        return 100;
      },
    });

    client.on("error", (err) => {
      // Sliently handle connection errors to prevent app crash
    });

    return client;
  } catch (e) {
    return new MockRedis() as any;
  }
})();

export const getRedisClient = () => redis;
export const isRedisAvailable = redis.status === "ready";

// Wrap redis to auto-fallback if connection is lost
const redisProxy = new Proxy(redis, {
  get(target, prop) {
    if (redis.status === "ready" || typeof prop !== "string") {
      return Reflect.get(target, prop);
    }
    const mock = new MockRedis();
    return (mock as any)[prop] || (() => Promise.resolve(null));
  },
});

export default redisProxy;
