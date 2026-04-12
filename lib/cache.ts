/**
 * Simple In-Memory Cache for API Routes
 * Production: Replace with Redis
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly defaultTTL: number = 60 * 1000; // 1 minute default

  constructor() {
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, data: T, ttlSeconds?: number): void {
    const ttl = (ttlSeconds ?? 60) * 1000; // Convert to ms
    
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
    });
  }

  /**
   * Delete specific key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Delete keys matching pattern
   */
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern.replace('*', '.*'));
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`[Cache] Cleaned up ${cleaned} expired entries`);
    }
  }
}

// Global cache instance
export const cache = new MemoryCache();

/**
 * Cache wrapper for async functions
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds?: number
): Promise<T> {
  // Try to get from cache
  const cached = cache.get<T>(key);
  
  if (cached !== null) {
    return cached;
  }
  
  // Execute function
  const result = await fn();
  
  // Store in cache
  cache.set(key, result, ttlSeconds);
  
  return result;
}

/**
 * Generate cache key
 */
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  
  return `${prefix}:${sortedParams}`;
}

/**
 * Invalidate cache by tags
 */
export function invalidateCache(tags: string[]): void {
  for (const tag of tags) {
    cache.deletePattern(`*${tag}*`);
  }
}
