"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { apiCache, generateCacheKey, CACHE_TTL } from "@/lib/utils/cache";

interface UseCachedDataOptions {
  cacheKey?: string;
  ttl?: number;
  staleWhileRevalidate?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

interface UseCachedDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isStale: boolean;
  refresh: () => void;
  setData: (data: T | null) => void;
  invalidate: () => void;
}

export function useCachedData<T>(
  load: () => Promise<T>,
  deps: unknown[] = [],
  options: UseCachedDataOptions = {}
): UseCachedDataResult<T> {
  const {
    cacheKey: customCacheKey,
    ttl = CACHE_TTL.MEDIUM,
    staleWhileRevalidate = false,
    retryCount = 1,
    retryDelay = 1000,
  } = options;

  const cacheKey = useMemo(() => {
    if (customCacheKey) return customCacheKey;
    return generateCacheKey("async_data", { deps, fn: load.name });
  }, [customCacheKey, load.name, deps]);

  const [data, setData] = useState<T | null>(() => {
    // Try to get initial data from cache
    return apiCache.get<T>(cacheKey) ?? null;
  });
  const [loading, setLoading] = useState(data === null);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  const loadRef = useRef(load);
  const dependencyKey = useMemo(() => JSON.stringify(deps), [deps]);

  useEffect(() => {
    loadRef.current = load;
  }, [load]);

  const refresh = useCallback(() => {
    setRefreshCount((prev) => prev + 1);
    setIsStale(false);
  }, []);

  const invalidate = useCallback(() => {
    apiCache.delete(cacheKey);
    setData(null);
    setLoading(true);
    refresh();
  }, [cacheKey, refresh]);

  useEffect(() => {
    let mounted = true;
    let retryTimeout: NodeJS.Timeout;

    const executeLoad = async (attempt: number = 0) => {
      // Check cache first
      const cached = apiCache.get<T>(cacheKey);
      
      if (cached && !isStale) {
        if (mounted) {
          setData(cached);
          setLoading(false);
          
          // Background refresh if stale-while-revalidate is enabled
          if (staleWhileRevalidate) {
            setIsStale(true);
            Promise.resolve().then(async () => {
              try {
                const fresh = await loadRef.current();
                if (mounted) {
                  setData(fresh);
                  apiCache.set(cacheKey, fresh, ttl);
                  setIsStale(false);
                }
              } catch {
                // Ignore background refresh errors
              }
            });
          }
        }
        return;
      }

      if (mounted) {
        setLoading(true);
        setError(null);
      }

      try {
        const value = await loadRef.current();
        if (mounted) {
          setData(value);
          apiCache.set(cacheKey, value, ttl);
          setIsStale(false);
        }
      } catch (err: unknown) {
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : "Unexpected error";
          setError(errorMessage);
          
          // Retry logic
          if (attempt < retryCount) {
            retryTimeout = setTimeout(() => {
              executeLoad(attempt + 1);
            }, retryDelay * (attempt + 1));
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    executeLoad();

    return () => {
      mounted = false;
      clearTimeout(retryTimeout);
    };
  }, [cacheKey, dependencyKey, refreshCount, ttl, staleWhileRevalidate, retryCount, retryDelay, isStale]);

  const setDataAndCache = useCallback((newData: T | null) => {
    setData(newData);
    if (newData !== null) {
      apiCache.set(cacheKey, newData, ttl);
    } else {
      apiCache.delete(cacheKey);
    }
  }, [cacheKey, ttl]);

  return {
    data,
    loading,
    error,
    isStale,
    refresh,
    setData: setDataAndCache,
    invalidate,
  };
}

// Optimized infinite scroll hook
interface UseInfiniteScrollOptions<T> {
  fetchPage: (page: number, pageSize: number) => Promise<{ items: T[]; hasMore: boolean }>;
  pageSize?: number;
  cachePrefix?: string;
  ttl?: number;
}

interface UseInfiniteScrollResult<T> {
  items: T[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

export function useInfiniteScroll<T>(
  options: UseInfiniteScrollOptions<T>
): UseInfiniteScrollResult<T> {
  const { fetchPage, pageSize = 20, cachePrefix = "infinite", ttl = CACHE_TTL.LONG } = options;

  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);

  const fetchPageRef = useRef(fetchPage);

  useEffect(() => {
    fetchPageRef.current = fetchPage;
  }, [fetchPage]);

  const loadPage = useCallback(async (pageNum: number, isInitial: boolean = false) => {
    const cacheKey = `${cachePrefix}_page_${pageNum}`;
    const cached = apiCache.get<{ items: T[]; hasMore: boolean }>(cacheKey);

    if (cached && isInitial) {
      setItems((prev) => (pageNum === 1 ? cached.items : [...prev, ...cached.items]));
      setHasMore(cached.hasMore);
      setLoading(false);
      return;
    }

    try {
      const result = await fetchPageRef.current(pageNum, pageSize);
      
      if (isInitial) {
        setItems(result.items);
      } else {
        setItems((prev) => [...prev, ...result.items]);
      }
      
      setHasMore(result.hasMore);
      apiCache.set(cacheKey, result, ttl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [pageSize, cachePrefix, ttl]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setPage(1);
    loadPage(1, true);
  }, [refreshCount, loadPage]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    loadPage(nextPage, false);
  }, [page, loadingMore, hasMore, loadPage]);

  const refresh = useCallback(() => {
    // Clear all pages for this cache prefix
    for (let i = 1; i <= page; i++) {
      apiCache.delete(`${cachePrefix}_page_${i}`);
    }
    setItems([]);
    setRefreshCount((prev) => prev + 1);
  }, [cachePrefix, page]);

  return {
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}
