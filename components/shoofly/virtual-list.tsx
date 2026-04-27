"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  overscan?: number;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
}

export function VirtualList<T>({
  items,
  renderItem,
  itemHeight,
  overscan = 3,
  className = "",
  emptyMessage = "لا توجد عناصر",
  loading = false,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });
    
    resizeObserver.observe(containerRef.current);
    setContainerHeight(containerRef.current.clientHeight);
    
    return () => resizeObserver.disconnect();
  }, []);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  const { virtualItems, totalHeight, startIndex } = useMemo(() => {
    const totalHeight = items.length * itemHeight;
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight) + overscan * 2;
    const endIndex = Math.min(items.length, startIndex + visibleCount);
    
    const virtualItems = items.slice(startIndex, endIndex).map((item, idx) => ({
      item,
      index: startIndex + idx,
      style: {
        position: "absolute" as const,
        top: (startIndex + idx) * itemHeight,
        height: itemHeight,
        left: 0,
        right: 0,
      },
    }));
    
    return { virtualItems, totalHeight, startIndex };
  }, [items, itemHeight, scrollTop, containerHeight, overscan]);

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center`}>
        <div className="animate-pulse flex space-x-4">
          <div className="h-4 w-32 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`${className} flex items-center justify-center text-slate-400`}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`${className} overflow-auto`}
      style={{ contain: "strict" }}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {virtualItems.map(({ item, index, style }) => (
          <div key={index} style={style}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Windowed list with variable height support
interface WindowedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  estimateHeight: (item: T) => number;
  className?: string;
  overscan?: number;
}

export function WindowedList<T>({
  items,
  renderItem,
  estimateHeight,
  className = "",
  overscan = 2,
}: WindowedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const { itemPositions, totalHeight, visibleRange } = useMemo(() => {
    const positions: { top: number; height: number }[] = [];
    let currentTop = 0;
    
    for (const item of items) {
      const height = estimateHeight(item);
      positions.push({ top: currentTop, height });
      currentTop += height;
    }

    const startIndex = Math.max(0, positions.findIndex(p => p.top + p.height > scrollTop) - overscan);
    const endIndex = Math.min(
      items.length,
      positions.findIndex(p => p.top > scrollTop + containerHeight) + overscan
    );

    return {
      itemPositions: positions,
      totalHeight: currentTop,
      visibleRange: { start: startIndex, end: endIndex === -1 ? items.length : endIndex },
    };
  }, [items, estimateHeight, scrollTop, containerHeight, overscan]);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`${className} overflow-auto`}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {items.slice(visibleRange.start, visibleRange.end).map((item, idx) => {
          const actualIndex = visibleRange.start + idx;
          const position = itemPositions[actualIndex];
          return (
            <div
              key={actualIndex}
              style={{
                position: "absolute",
                top: position?.top || 0,
                height: position?.height || 0,
                left: 0,
                right: 0,
              }}
            >
              {renderItem(item, actualIndex, {})}
            </div>
          );
        })}
      </div>
    </div>
  );
}
