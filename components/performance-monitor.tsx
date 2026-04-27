"use client";

import { useEffect, useState } from "react";

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || process.env.NODE_ENV !== "development") return;

    // Web Vitals monitoring
    if ("PerformanceObserver" in window) {
      // LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        setMetrics((m) => ({ ...m, lcp: lastEntry.startTime }));
      });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

      // FID
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "first-input") {
            const fid = (entry as any).processingStart - entry.startTime;
            setMetrics((m) => ({ ...m, fid }));
          }
        }
      });
      fidObserver.observe({ entryTypes: ["first-input"] });

      // CLS
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        setMetrics((m) => ({ ...m, cls: clsValue }));
      });
      clsObserver.observe({ entryTypes: ["layout-shift"] });

      // FCP
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === "first-contentful-paint") {
            setMetrics((m) => ({ ...m, fcp: entry.startTime }));
          }
        }
      });
      paintObserver.observe({ entryTypes: ["paint"] });

      // TTFB
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      if (navigation) {
        setMetrics((m) => ({ ...m, ttfb: navigation.responseStart - navigation.startTime }));
      }

      return () => {
        lcpObserver.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
        paintObserver.disconnect();
      };
    }
  }, []);

  if (process.env.NODE_ENV !== "development") return null;

  const getMetricColor = (name: string, value: number) => {
    switch (name) {
      case "fcp":
        return value < 1800 ? "text-emerald-500" : value < 3000 ? "text-amber-500" : "text-rose-500";
      case "lcp":
        return value < 2500 ? "text-emerald-500" : value < 4000 ? "text-amber-500" : "text-rose-500";
      case "fid":
        return value < 100 ? "text-emerald-500" : value < 300 ? "text-amber-500" : "text-rose-500";
      case "cls":
        return value < 0.1 ? "text-emerald-500" : value < 0.25 ? "text-amber-500" : "text-rose-500";
      case "ttfb":
        return value < 600 ? "text-emerald-500" : value < 1000 ? "text-amber-500" : "text-rose-500";
      default:
        return "text-slate-500";
    }
  };

  return (
    <>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 left-4 z-50 px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium shadow-lg hover:bg-slate-800 transition-colors"
      >
        {isVisible ? "إخفاء" : "الأداء"}
      </button>

      {isVisible && (
        <div className="fixed bottom-16 left-4 z-50 p-4 bg-white rounded-xl shadow-2xl border border-slate-200 min-w-[200px]">
          <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Core Web Vitals</h3>
          <div className="space-y-2 text-xs">
            {metrics.fcp !== undefined && (
              <div className="flex justify-between">
                <span className="text-slate-600">FCP:</span>
                <span className={getMetricColor("fcp", metrics.fcp)}>{Math.round(metrics.fcp)}ms</span>
              </div>
            )}
            {metrics.lcp !== undefined && (
              <div className="flex justify-between">
                <span className="text-slate-600">LCP:</span>
                <span className={getMetricColor("lcp", metrics.lcp)}>{Math.round(metrics.lcp)}ms</span>
              </div>
            )}
            {metrics.fid !== undefined && (
              <div className="flex justify-between">
                <span className="text-slate-600">FID:</span>
                <span className={getMetricColor("fid", metrics.fid)}>{Math.round(metrics.fid)}ms</span>
              </div>
            )}
            {metrics.cls !== undefined && (
              <div className="flex justify-between">
                <span className="text-slate-600">CLS:</span>
                <span className={getMetricColor("cls", metrics.cls)}>{metrics.cls.toFixed(3)}</span>
              </div>
            )}
            {metrics.ttfb !== undefined && (
              <div className="flex justify-between">
                <span className="text-slate-600">TTFB:</span>
                <span className={getMetricColor("ttfb", metrics.ttfb)}>{Math.round(metrics.ttfb)}ms</span>
              </div>
            )}
            {Object.keys(metrics).length === 0 && (
              <span className="text-slate-400">جاري القياس...</span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
