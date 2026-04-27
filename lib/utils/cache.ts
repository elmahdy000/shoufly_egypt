// Simple in-memory cache with TTL
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data;
  }

  set<T>(key: string, data: T, ttlMs: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  clearByPattern(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  getSize(): number {
    return this.cache.size;
  }
}

export const apiCache = new MemoryCache();

// Cache key generator
export function generateCacheKey(prefix: string, params?: Record<string, unknown>): string {
  if (!params) return prefix;
  const sortedParams = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
    .join("&");
  return `${prefix}?${sortedParams}`;
}

// Cache TTL constants
export const CACHE_TTL = {
  SHORT: 30000,    // 30 seconds
  MEDIUM: 60000,   // 1 minute
  LONG: 300000,    // 5 minutes
  VERY_LONG: 900000, // 15 minutes
} as const;

// Prefetch utility
export function prefetchData<T>(
  fetcher: () => Promise<T>,
  cacheKey: string,
  ttl: number = CACHE_TTL.MEDIUM
): void {
  if (typeof window === "undefined") return;
  
  // Use requestIdleCallback for non-critical prefetching
  const schedule = (window as any).requestIdleCallback || setTimeout;
  
  schedule(() => {
    if (!apiCache.get(cacheKey)) {
      fetcher()
        .then((data) => apiCache.set(cacheKey, data, ttl))
        .catch(() => {}); // Silently fail
    }
  });
}

// Stale-while-revalidate pattern
export async function staleWhileRevalidate<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<T> {
  const cached = apiCache.get<T>(cacheKey);
  
  if (cached) {
    // Return cached data immediately, then refresh in background
    if (typeof window !== "undefined") {
      setTimeout(() => {
        fetcher()
          .then((data) => apiCache.set(cacheKey, data, ttl))
          .catch(() => {});
      }, 0);
    }
    return cached;
  }
  
  // No cache, fetch fresh data
  const data = await fetcher();
  apiCache.set(cacheKey, data, ttl);
  return data;
}

// LocalStorage cache for persistent data
export const persistentCache = {
  get<T>(key: string): T | null {
    if (typeof window === "undefined") return null;
    try {
      const item = localStorage.getItem(`shoofly_cache_${key}`);
      if (!item) return null;
      
      const { data, expiry } = JSON.parse(item);
      if (expiry && Date.now() > expiry) {
        localStorage.removeItem(`shoofly_cache_${key}`);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  },

  set<T>(key: string, data: T, ttlMinutes: number = 60): void {
    if (typeof window === "undefined") return;
    try {
      const expiry = Date.now() + ttlMinutes * 60 * 1000;
      localStorage.setItem(
        `shoofly_cache_${key}`,
        JSON.stringify({ data, expiry })
      );
    } catch {
      // Storage full or other error
    }
  },

  remove(key: string): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(`shoofly_cache_${key}`);
  },

  clear(): void {
    if (typeof window === "undefined") return;
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith("shoofly_cache_")) {
        localStorage.removeItem(key);
      }
    }
  },
};
