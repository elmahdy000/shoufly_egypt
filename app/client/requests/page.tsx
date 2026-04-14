"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/shoofly/status-badge";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { listClientRequests } from "@/lib/api/requests";
import { formatDate } from "@/lib/formatters";
import {
  FiPlus, FiPackage, FiMapPin, FiSearch,
  FiChevronLeft, FiRefreshCw, FiTag, FiCalendar, FiInbox
} from "react-icons/fi";

const STATUSES = [
  { value: "ALL",                         label: "الكل",      dot: "" },
  { value: "PENDING_ADMIN_REVISION",      label: "مراجعة",   dot: "bg-slate-400" },
  { value: "OPEN_FOR_BIDDING",            label: "مفتوح",    dot: "bg-blue-400" },
  { value: "OFFERS_FORWARDED",            label: "عروض",     dot: "bg-amber-400" },
  { value: "ORDER_PAID_PENDING_DELIVERY", label: "تنفيذ",    dot: "bg-violet-400" },
  { value: "CLOSED_SUCCESS",              label: "مكتمل",    dot: "bg-emerald-400" },
  { value: "CLOSED_CANCELLED",            label: "ملغي",     dot: "bg-rose-400" },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING_ADMIN_REVISION:      { label: "قيد المراجعة",    color: "bg-slate-100 text-slate-600" },
  OPEN_FOR_BIDDING:            { label: "مفتوح للعروض",    color: "bg-blue-50 text-blue-600" },
  OFFERS_FORWARDED:            { label: "عروض جديدة",       color: "bg-amber-50 text-amber-600" },
  ORDER_PAID_PENDING_DELIVERY: { label: "جاري التنفيذ",    color: "bg-violet-50 text-violet-600" },
  CLOSED_SUCCESS:              { label: "مكتمل",            color: "bg-emerald-50 text-emerald-700" },
  CLOSED_FAILED:               { label: "فشل",              color: "bg-rose-50 text-rose-600" },
  CLOSED_CANCELLED:            { label: "ملغي",             color: "bg-rose-50 text-rose-500" },
};

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-100 rounded-xl shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 bg-slate-100 rounded w-3/5" />
          <div className="h-3 bg-slate-100 rounded w-1/4" />
        </div>
        <div className="h-6 w-20 bg-slate-100 rounded-full" />
      </div>
      <div className="h-3 bg-slate-100 rounded w-2/3" />
      <div className="h-3 bg-slate-100 rounded w-1/3" />
    </div>
  );
}

export default function ClientRequestsPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const { data, loading, error, refresh } = useAsyncData(() => listClientRequests(), []);

  const counts = useMemo(() => {
    const list = data ?? [];
    const map: Record<string, number> = { ALL: list.length };
    STATUSES.slice(1).forEach(s => {
      map[s.value] = list.filter((r: any) => r.status === s.value).length;
    });
    return map;
  }, [data]);

  const rows = useMemo(() => {
    let list = data ?? [];
    if (statusFilter !== "ALL") list = list.filter((r: any) => r.status === statusFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((r: any) =>
        r.title?.toLowerCase().includes(q) ||
        r.address?.toLowerCase().includes(q) ||
        String(r.id).includes(q)
      );
    }
    return list;
  }, [data, statusFilter, search]);

  return (
    <div className="p-5 max-w-3xl mx-auto space-y-5 font-sans text-right pb-28" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FiPackage className="text-primary" size={20} /> طلباتي
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {loading ? 'جاري التحميل...' : `${data?.length ?? 0} طلب`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <FiRefreshCw size={16} />
          </button>
          <Link
            href="/client/requests/new"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <FiPlus size={16} /> جديد
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute top-1/2 -translate-y-1/2 right-3.5 text-slate-400" size={16} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ابحث بالعنوان أو الرقم..."
          className="w-full bg-white border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {STATUSES.map(s => {
          const count = counts[s.value] ?? 0;
          const active = statusFilter === s.value;
          if (s.value !== "ALL" && count === 0) return null;
          return (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                active
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {s.dot && (
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? "bg-white/70" : s.dot}`} />
              )}
              {s.label}
              <span className={`text-[10px] font-bold min-w-[16px] text-center tabular-nums ${active ? "opacity-80" : "text-slate-400"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm p-4 rounded-2xl">
          {error}
        </div>
      )}

      {/* Skeleton */}
      {loading && (
        <div className="space-y-3">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      )}

      {/* Empty */}
      {!loading && !error && rows.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
            <FiInbox size={28} />
          </div>
          <h3 className="font-semibold text-slate-800 mb-1">
            {search ? "لا نتائج مطابقة" : statusFilter === "ALL" ? "لا توجد طلبات" : "لا توجد طلبات في هذه الحالة"}
          </h3>
          <p className="text-sm text-slate-400 mb-5">
            {search ? "جرب كلمة بحث مختلفة" : "ابدأ بإنشاء طلبك الأول"}
          </p>
          {!search && statusFilter === "ALL" && (
            <Link
              href="/client/requests/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90"
            >
              <FiPlus size={15} /> طلب جديد
            </Link>
          )}
        </div>
      )}

      {/* List */}
      {!loading && rows.length > 0 && (
        <div className="space-y-3">
          {rows.map((request: any) => {
            const st = STATUS_MAP[request.status] ?? { label: request.status, color: "bg-slate-100 text-slate-600" };
            const hasNewOffers = request.status === "OFFERS_FORWARDED";
            const isPaid = request.status === "ORDER_PAID_PENDING_DELIVERY";

            return (
              <Link
                key={request.id}
                href={`/client/requests/${request.id}`}
                className="bg-white rounded-2xl border border-slate-200 p-4 flex items-start gap-3 hover:shadow-md hover:border-primary/30 transition-all group block"
              >
                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  hasNewOffers ? "bg-amber-50 text-amber-500"
                  : isPaid ? "bg-violet-50 text-violet-500"
                  : "bg-slate-100 text-slate-500"
                }`}>
                  <FiPackage size={20} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-1">{request.title}</h3>
                    <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${st.color}`}>
                      {st.label}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-1.5 truncate">
                    <FiMapPin size={11} className="shrink-0 text-slate-400" />
                    <span className="truncate">{request.address || "لا يوجد عنوان"}</span>
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <FiTag size={11} /> #{request.id}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <FiCalendar size={11} /> {formatDate(request.createdAt)}
                      </span>
                    </div>

                    {hasNewOffers && (
                      <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        عروض جديدة
                      </span>
                    )}

                    <FiChevronLeft size={16} className="text-slate-300 group-hover:text-primary transition-colors shrink-0 mr-auto" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
