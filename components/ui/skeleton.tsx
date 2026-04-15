/**
 * Reusable Skeleton primitives for Admin data tables, KPI cards, and panels.
 * Usage: import { SkeletonCard, SkeletonTable, SkeletonKpiRow } from "@/components/ui/skeleton"
 */

function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-100 ${className}`}
      aria-hidden="true"
    />
  );
}

/** 3 KPI metric cards in a row */
export function SkeletonKpiRow({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-2 gap-4 lg:grid-cols-${count}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
        >
          <div className="mb-3 flex items-center justify-between">
            <SkeletonBox className="h-3 w-24" />
            <SkeletonBox className="h-9 w-9 rounded-xl" />
          </div>
          <SkeletonBox className="h-7 w-32" />
        </div>
      ))}
    </div>
  );
}

/** Generic data card (vendor/user card) */
export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <SkeletonBox className="h-12 w-12 shrink-0 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <SkeletonBox className="h-4 w-3/4" />
          <SkeletonBox className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-2 border-t border-slate-100 pt-3">
        <SkeletonBox className="h-3 w-full" />
        <SkeletonBox className="h-3 w-4/5" />
        <SkeletonBox className="h-3 w-2/3" />
      </div>
      <SkeletonBox className="mt-4 h-10 w-full rounded-xl" />
    </div>
  );
}

/** Grid of skeleton cards */
export function SkeletonCardGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/** Data table skeleton */
export function SkeletonTable({ rows = 8 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      {/* Table header */}
      <div className="flex gap-4 border-b border-slate-100 bg-slate-50/70 px-6 py-4">
        {[32, 48, 24, 20, 16].map((w, i) => (
          <SkeletonBox key={i} className={`h-3 w-${w}`} />
        ))}
      </div>
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-slate-50 px-6 py-4"
        >
          <SkeletonBox className="h-9 w-9 shrink-0 rounded-full" />
          <SkeletonBox className="h-3 w-32" />
          <SkeletonBox className="h-3 flex-1" />
          <SkeletonBox className="h-6 w-20 rounded-lg" />
          <SkeletonBox className="h-3 w-24" />
          <SkeletonBox className="h-8 w-8 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

/** Full page skeleton for admin dashboard pages */
export function SkeletonAdminPage() {
  return (
    <div className="admin-page admin-page--spacious animate-pulse" dir="rtl">
      {/* Header section */}
      <section className="rounded-3xl border border-slate-200 bg-white p-8">
        <div className="flex items-end justify-between">
          <div className="space-y-3">
            <SkeletonBox className="h-5 w-32 rounded-full" />
            <SkeletonBox className="h-9 w-72" />
            <SkeletonBox className="h-3 w-96" />
          </div>
          <SkeletonBox className="h-11 w-40 rounded-xl" />
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 p-5">
              <div className="mb-3 flex justify-between">
                <SkeletonBox className="h-3 w-20" />
                <SkeletonBox className="h-8 w-8 rounded-xl" />
              </div>
              <SkeletonBox className="h-7 w-24" />
            </div>
          ))}
        </div>
      </section>

      {/* Filter tabs */}
      <SkeletonBox className="h-14 w-full rounded-2xl" />

      {/* Content area */}
      <SkeletonCardGrid count={6} />
    </div>
  );
}

/** Sidebar/panel skeleton */
export function SkeletonPanel() {
  return (
    <div className="w-full space-y-5 rounded-3xl border border-slate-100 bg-white p-7 shadow-sm xl:w-[430px]">
      <div className="flex items-center gap-3">
        <SkeletonBox className="h-12 w-12 rounded-2xl" />
        <div className="space-y-2">
          <SkeletonBox className="h-4 w-36" />
          <SkeletonBox className="h-3 w-24" />
        </div>
      </div>
      <SkeletonBox className="h-32 w-full rounded-2xl" />
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonBox key={i} className="h-11 w-full rounded-xl" />
      ))}
      <div className="grid grid-cols-2 gap-3">
        <SkeletonBox className="h-16 rounded-xl" />
        <SkeletonBox className="h-16 rounded-xl" />
      </div>
    </div>
  );
}
