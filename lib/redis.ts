/**
 * Redis Client Configuration
 * Used for distributed rate limiting and caching
 */

import Redis from 'ioredis';

// Redis connection configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  showFriendlyErrorStack: process.env.NODE_ENV !== 'production',
};

// Create Redis client singleton
let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(redisConfig);
    
    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });
    
    redisClient.on('error', (err) => {
      console.error('❌ Redis error:', err);
    });
    
    redisClient.on('close', () => {
      console.log('🔌 Redis connection closed');
    });
  }
  
  return redisClient;
}

// Check if Redis is available
export async function isRedisAvailable(): Promise<boolean> {
  try {
    const client = getRedisClient();
    await client.ping();
    return true;
  } catch {
    return false;
  }
}

// Graceful shutdown
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
