"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ErrorState } from "@/components/shared/error-state";
import { listVendorBids } from "@/lib/api/bids";
import { formatCurrency } from "@/lib/formatters";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import {
  FiTag, FiCheckCircle, FiClock, FiXCircle,
  FiPackage, FiRefreshCw, FiInbox, FiCalendar,
} from "react-icons/fi";

const FILTERS = [
  { value: "ALL",               label: "الكل",       dot: "" },
  { value: "PENDING",           label: "انتظار",     dot: "bg-amber-400" },
  { value: "SELECTED",          label: "مرشح",       dot: "bg-blue-400" },
  { value: "ACCEPTED_BY_CLIENT",label: "مقبول",      dot: "bg-emerald-400" },
  { value: "REJECTED",          label: "مرفوض",      dot: "bg-rose-400" },
];

const STATUS_CFG: Record<string, { label: string; badge: string; border: string; icon: any }> = {
  PENDING:            { label: "قيد الانتظار",       badge: "bg-amber-50 text-amber-600",   border: "border-r-amber-400",   icon: FiClock },
  SELECTED:           { label: "مرشح للعميل",        badge: "bg-blue-50 text-blue-600",     border: "border-r-blue-400",    icon: FiPackage },
  ACCEPTED_BY_CLIENT: { label: "تم القبول",          badge: "bg-emerald-50 text-emerald-600", border: "border-r-emerald-400", icon: FiCheckCircle },
  REJECTED:           { label: "مرفوض",              badge: "bg-rose-50 text-rose-600",     border: "border-r-rose-400",    icon: FiXCircle },
};

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse border-r-4 border-r-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-slate-100 rounded w-2/3" />
          <div className="h-3 bg-slate-100 rounded w-full" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
        </div>
        <div className="h-6 w-16 bg-slate-100 rounded-full" />
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <div className="h-3 w-20 bg-slate-100 rounded" />
        <div className="h-5 w-24 bg-slate-100 rounded" />
      </div>
    </div>
  );
}

export default function VendorBidsPage() {
  const [filter, setFilter] = useState("ALL");
  const { data, loading, error, refresh } = useAsyncData(() => listVendorBids(), []);

  const counts = useMemo(() => {
    const list = data ?? [];
    const map: Record<string, number> = { ALL: list.length };
    FILTERS.forEach(f => {
      if (f.value !== "ALL") map[f.value] = list.filter((b: any) => b.status === f.value).length;
    });
    return map;
  }, [data]);

  const rows = useMemo(() => {
    const list = data ?? [];
    if (filter === "ALL") return list;
    return list.filter((b: any) => b.status === filter);
  }, [data, filter]);

  const accepted  = counts["ACCEPTED_BY_CLIENT"] ?? 0;
  const pending   = (counts["PENDING"] ?? 0) + (counts["SELECTED"] ?? 0);
  const rejected  = counts["REJECTED"] ?? 0;

  return (
    <div className="p-5 max-w-3xl mx-auto space-y-5 font-sans text-right pb-28" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FiTag className="text-primary" size={20} /> عروضي
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {loading ? "جاري التحميل..." : `${data?.length ?? 0} عرض`}
          </p>
        </div>
        <button
          onClick={refresh}
          className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <FiRefreshCw size={16} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <p className="text-[11px] text-slate-500 font-medium mb-1">مقبولة</p>
          <p className="text-xl font-bold text-emerald-600">{loading ? "—" : accepted}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <p className="text-[11px] text-slate-500 font-medium mb-1">قيد المراجعة</p>
          <p className="text-xl font-bold text-amber-500">{loading ? "—" : pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 text-center">
          <p className="text-[11px] text-slate-500 font-medium mb-1">مرفوضة</p>
          <p className="text-xl font-bold text-rose-500">{loading ? "—" : rejected}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {FILTERS.map(f => {
          const count = counts[f.value] ?? 0;
          const active = filter === f.value;
          if (f.value !== "ALL" && count === 0) return null;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                active
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {f.dot && (
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? "bg-white/70" : f.dot}`} />
              )}
              {f.label}
              <span className={`text-[10px] font-bold min-w-[16px] text-center tabular-nums ${active ? "opacity-80" : "text-slate-400"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Error */}
      {error && <ErrorState message={error} />}

      {/* Empty */}
      {!loading && !error && rows.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-400">
            <FiInbox size={22} />
          </div>
          <p className="text-sm font-semibold text-slate-700 mb-1">لا توجد عروض</p>
          <p className="text-xs text-slate-400">
            {filter === "ALL" ? "لم تقدم أي عروض بعد" : "لا توجد عروض في هذه الحالة"}
          </p>
        </div>
      )}

      {/* Bid cards */}
      {!loading && !error && rows.length > 0 && (
        <div className="space-y-3">
          {rows.map((bid: any) => {
            const cfg = STATUS_CFG[bid.status] ?? STATUS_CFG["PENDING"];
            const StatusIcon = cfg.icon;
            const isAccepted = bid.status === "ACCEPTED_BY_CLIENT";
            const title = bid.request?.title ?? `طلب #${bid.requestId}`;
            const dateStr = bid.createdAt
              ? new Date(bid.createdAt).toLocaleDateString("ar-EG", { day: "numeric", month: "short" })
              : null;

            return (
              <div
                key={bid.id}
                className={`bg-white rounded-xl border border-slate-200 border-r-4 ${cfg.border} p-4 transition-shadow hover:shadow-sm`}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-900 truncate mb-0.5">{title}</p>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {bid.description || "لا يوجد وصف"}
                    </p>
                  </div>
                  <span className={`shrink-0 flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg ${cfg.badge}`}>
                    <StatusIcon size={11} />
                    {cfg.label}
                  </span>
                </div>

                {/* Bottom row */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    {dateStr && (
                      <>
                        <FiCalendar size={11} />
                        <span>{dateStr}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {isAccepted && (
                      <Link
                        href={`/vendor/bids/${bid.id}`}
                        className="text-[11px] font-semibold text-primary hover:underline"
                      >
                        عرض التفاصيل
                      </Link>
                    )}
                    <span className={`text-sm font-bold ${isAccepted ? "text-emerald-600" : "text-slate-800"}`}>
                      {formatCurrency(bid.netPrice)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
