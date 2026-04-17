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
    <div className="space-y-6 min-h-screen font-sans" dir="rtl">

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FiPackage className="text-primary" size={24} />
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">طلباتي</h1>
          </div>
          <p className="text-sm text-slate-500">إدارة وتتبع جميع الطلبات الخاصة بك</p>
        </div>
        <Link
          href="/client/requests/new"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md"
        >
          <FiPlus size={18} />
          <span>طلب جديد</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: "الإجمالي", value: data?.length ?? 0, icon: FiPackage, color: "from-slate-50 to-white", icon_bg: "bg-slate-100", icon_color: "text-slate-600" },
          { label: "قيد المراجعة", value: data?.filter((r: any) => r.status === "PENDING_ADMIN_REVISION").length ?? 0, icon: FiRefreshCw, color: "from-amber-50 to-white", icon_bg: "bg-amber-100", icon_color: "text-amber-600" },
          { label: "عروض جديدة", value: data?.filter((r: any) => r.status === "OFFERS_FORWARDED").length ?? 0, icon: FiTag, color: "from-emerald-50 to-white", icon_bg: "bg-emerald-100", icon_color: "text-emerald-600" },
          { label: "جاري التنفيذ", value: data?.filter((r: any) => r.status === "ORDER_PAID_PENDING_DELIVERY").length ?? 0, icon: FiPackage, color: "from-blue-50 to-white", icon_bg: "bg-blue-100", icon_color: "text-blue-600" },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`rounded-2xl border border-slate-200 bg-gradient-to-br ${stat.color} p-4 md:p-5 shadow-sm hover:shadow-md transition-all group`}>
              <div className={`${stat.icon_bg} w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className={`${stat.icon_color}`} size={20} />
              </div>
              <p className="text-xs text-slate-500 font-semibold mb-1">{stat.label}</p>
              <p className="text-2xl md:text-3xl font-black text-slate-900 tabular-nums">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث في طلباتك..."
            className="w-full h-12 bg-white border border-slate-200 rounded-xl pr-12 pl-4 text-sm placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {STATUSES.map(s => {
            const count = counts[s.value] ?? 0;
            const active = statusFilter === s.value;
            if (s.value !== "ALL" && count === 0) return null;
            return (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                  active
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {s.dot && (
                  <span className={`w-2 h-2 rounded-full shrink-0 ${active ? "bg-white/70" : s.dot}`} />
                )}
                {s.label}
                {count > 0 && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    active ? "bg-white/20" : "bg-slate-100 text-slate-600"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl font-medium">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-3/5" />
                  <div className="h-3 bg-slate-100 rounded w-2/5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && rows.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
            <FiInbox size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            {search ? "لا توجد نتائج" : statusFilter === "ALL" ? "لا توجد طلبات بعد" : "لا توجد طلبات في هذه الحالة"}
          </h3>
          <p className="text-slate-500 mb-6">
            {search ? "جرب كلمة بحث مختلفة" : "ابدأ بإنشاء طلبك الأول وتابع العروض"}
          </p>
          {!search && statusFilter === "ALL" && (
            <Link
              href="/client/requests/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              <FiPlus size={18} />
              طلب جديد
            </Link>
          )}
        </div>
      )}

      {/* Requests List */}
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
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all p-5 group block"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    hasNewOffers ? "bg-amber-50 text-amber-600"
                    : isPaid ? "bg-blue-50 text-blue-600"
                    : "bg-slate-100 text-slate-500"
                  }`}>
                    <FiPackage size={24} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-primary transition-colors line-clamp-1">
                        {request.title}
                      </h3>
                      <span className={`shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap ${st.color}`}>
                        {st.label}
                      </span>
                    </div>

                    <p className="text-sm text-slate-500 line-clamp-1 mb-3 flex items-center gap-1.5">
                      <FiMapPin size={14} className="text-slate-400 shrink-0" />
                      {request.address || "بدون عنوان"}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <FiTag size={12} />
                          #{request.id}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiCalendar size={12} />
                          {formatDate(request.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {hasNewOffers && (
                          <span className="text-amber-600 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-600" />
                            عروض جديدة
                          </span>
                        )}
                        <FiChevronLeft size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Results Summary */}
      {!loading && rows.length > 0 && (
        <div className="text-center text-sm text-slate-600 py-4">
          عرض <span className="font-bold text-slate-900">{rows.length}</span> من <span className="font-bold text-slate-900">{data?.length ?? 0}</span> طلب
        </div>
      )}
    </div>
  );
}
