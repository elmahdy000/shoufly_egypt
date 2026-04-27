"use client";

import { useCallback, useRef, useEffect, useState, useMemo } from "react";

// Debounce hook for search inputs
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Throttle hook for scroll/resize events
export function useThrottle<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const lastExec = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastExec.current >= delay) {
        lastExec.current = now;
        callback(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          lastExec.current = Date.now();
          callback(...args);
        }, delay - (now - lastExec.current));
      }
    },
    [callback, delay]
  ) as T;
}

// Intersection observer hook for lazy loading
export function useIntersectionObserver(
  options?: IntersectionObserverInit
): [(node: Element | null) => void, boolean, IntersectionObserverEntry | undefined] {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const nodeRef = useRef<Element | null>(null);

  const setRef = useCallback(
    (node: Element | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (node && node instanceof Element) {
        observerRef.current = new IntersectionObserver(([entry]) => {
          setEntry(entry);
          setIsIntersecting(entry.isIntersecting);
        }, options);
        observerRef.current.observe(node);
      }

      nodeRef.current = node;
    },
    [options]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return [setRef, isIntersecting, entry];
}

// Memoized selector hook for expensive computations
export function useMemoizedSelector<T, R>(
  data: T,
  selector: (data: T) => R,
  deps: React.DependencyList
): R {
  return useMemo(() => selector(data), [data, ...deps]);
}

// Render count debugger (dev only)
export function useRenderCount(componentName: string) {
  const renderCount = useRef(0);
  
  if (process.env.NODE_ENV === 'development') {
    renderCount.current++;
    console.log(`${componentName} rendered ${renderCount.current} times`);
  }
}

// Optimized list filter with caching
export function useOptimizedFilter<T>(
  items: T[],
  filterFn: (item: T, query: string) => boolean,
  query: string,
  debounceMs: number = 150
): T[] {
  const debouncedQuery = useDebounce(query, debounceMs);
  
  return useMemo(() => {
    if (!debouncedQuery.trim()) return items;
    return items.filter(item => filterFn(item, debouncedQuery));
  }, [items, debouncedQuery, filterFn]);
}

// Paginated data hook
export function usePagination<T>(
  items: T[],
  pageSize: number
) {
  const [page, setPage] = useState(1);
  
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);
  
  const totalPages = Math.ceil(items.length / pageSize);
  
  const goToPage = useCallback((p: number) => {
    setPage(Math.max(1, Math.min(totalPages, p)));
  }, [totalPages]);
  
  const nextPage = useCallback(() => {
    setPage(p => Math.min(totalPages, p + 1));
  }, [totalPages]);
  
  const prevPage = useCallback(() => {
    setPage(p => Math.max(1, p - 1));
  }, []);
  
  return {
    items: paginatedItems,
    page,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    setPage,
  };
}

// Request idle callback for non-urgent work
export function useIdleCallback(callback: () => void, timeout: number = 2000) {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = (window as any).requestIdleCallback(callback, { timeout });
      return () => (window as any).cancelIdleCallback(id);
    } else {
      const id = setTimeout(callback, timeout);
      return () => clearTimeout(id);
    }
  }, [callback, timeout]);
}
