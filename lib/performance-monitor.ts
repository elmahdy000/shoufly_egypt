/**
 * Performance Monitoring & Optimization Utilities
 */

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 1000;

  /**
   * Track function execution time
   */
  async track<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const start = performance.now();
    
    try {
      const result = await fn();
      
      const duration = performance.now() - start;
      this.record(name, duration, metadata);
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.record(name, duration, { ...metadata, error: true });
      throw error;
    }
  }

  /**
   * Record a metric
   */
  record(name: string, duration: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow operations (> 1 second)
    if (duration > 1000) {
      console.warn(`[Performance] Slow operation: ${name} took ${duration.toFixed(2)}ms`, metadata);
    }
  }

  /**
   * Get average duration for an operation
   */
  getAverage(name: string, timeWindowMs: number = 60000): number {
    const cutoff = Date.now() - timeWindowMs;
    
    const relevant = this.metrics.filter(
      m => m.name === name && m.timestamp > cutoff
    );

    if (relevant.length === 0) return 0;

    const sum = relevant.reduce((acc, m) => acc + m.duration, 0);
    return sum / relevant.length;
  }

  /**
   * Get slowest operations
   */
  getSlowest(count: number = 10): PerformanceMetric[] {
    return [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, count);
  }

  /**
   * Get stats for an operation
   */
  getStats(name: string): {
    count: number;
    avg: number;
    min: number;
    max: number;
    p95: number;
  } {
    const relevant = this.metrics.filter(m => m.name === name);
    
    if (relevant.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0, p95: 0 };
    }

    const durations = relevant.map(m => m.duration).sort((a, b) => a - b);
    const sum = durations.reduce((a, b) => a + b, 0);
    
    const p95Index = Math.floor(durations.length * 0.95);
    
    return {
      count: relevant.length,
      avg: sum / relevant.length,
      min: durations[0],
      max: durations[durations.length - 1],
      p95: durations[p95Index] || 0,
    };
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const operations = [...new Set(this.metrics.map(m => m.name))];
    
    let report = '\n📊 Performance Report\n';
    report += '====================\n\n';
    
    for (const op of operations) {
      const stats = this.getStats(op);
      report += `${op}:\n`;
      report += `  Count: ${stats.count}\n`;
      report += `  Avg: ${stats.avg.toFixed(2)}ms\n`;
      report += `  Min: ${stats.min.toFixed(2)}ms\n`;
      report += `  Max: ${stats.max.toFixed(2)}ms\n`;
      report += `  P95: ${stats.p95.toFixed(2)}ms\n\n`;
    }

    return report;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }
}

// Global monitor instance
export const monitor = new PerformanceMonitor();

/**
 * React component render time tracker
 */
export function trackRender(componentName: string) {
  const start = performance.now();
  
  return () => {
    const duration = performance.now() - start;
    
    if (duration > 16) { // Longer than 1 frame (60fps)
      console.warn(`[Render] ${componentName} took ${duration.toFixed(2)}ms`);
    }
  };
}

/**
 * Web Vitals reporter (for Next.js)
 */
export function reportWebVitals(metric: any) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)}${metric.unit}`);
  }

  // In production, send to analytics
  // Example: send to your analytics endpoint
  // fetch('/api/analytics/vitals', { method: 'POST', body: JSON.stringify(metric) });
}

/**
 * Lazy loading detection helper
 */
export function observeLazyLoad(
  element: Element,
  onLoad: () => void,
  onError?: () => void
) {
  if (typeof window === 'undefined') return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          try {
            onLoad();
          } catch (error) {
            onError?.();
          }
          observer.disconnect();
        }
      });
    },
    { rootMargin: '50px' }
  );

  observer.observe(element);
  
  return () => observer.disconnect();
}

/**
 * Memory usage tracker (Node.js only)
 */
export function getMemoryUsage(): {
  heapUsed: string;
  heapTotal: string;
  external: string;
  rss: string;
} {
  const usage = process.memoryUsage();
  
  return {
    heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
    external: `${(usage.external / 1024 / 1024).toFixed(2)} MB`,
    rss: `${(usage.rss / 1024 / 1024).toFixed(2)} MB`,
  };
}

/**
 * Log current memory usage
 */
export function logMemoryUsage(label: string = 'Memory'): void {
  const mem = getMemoryUsage();
  console.log(`[${label}]`, mem);
}
