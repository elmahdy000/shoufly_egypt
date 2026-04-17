"use client";

import { useState, useMemo } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatDate } from "@/lib/formatters";
import { Search, Package, Clock, CheckCircle2, AlertCircle, Activity, ChevronLeft, Circle, Zap, XCircle } from "lucide-react";

interface Request {
  id: number;
  title: string;
  status: string;
  createdAt: string;
  client?: { fullName?: string };
}

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  PENDING_ADMIN_REVISION:      { label: "قيد المراجعة",            cls: "bg-amber-50 text-amber-700 border border-amber-200",   icon: Clock        },
  OPEN_FOR_BIDDING:            { label: "مفتوح للعروض",            cls: "bg-blue-50 text-blue-700 border border-blue-200",      icon: Activity     },
  BIDS_RECEIVED:               { label: "عروض واردة",              cls: "bg-purple-50 text-purple-700 border border-purple-200",icon: Activity     },
  OFFERS_FORWARDED:            { label: "عروض محولة",              cls: "bg-indigo-50 text-indigo-700 border border-indigo-200",icon: ChevronLeft  },
  ORDER_PAID_PENDING_DELIVERY: { label: "مدفوع - ينتظر التوصيل",  cls: "bg-orange-50 text-orange-700 border border-orange-200",icon: Circle       },
  CLOSED_SUCCESS:              { label: "مكتمل",                   cls: "bg-green-50 text-green-700 border border-green-200",   icon: CheckCircle2 },
  CLOSED_CANCELLED:            { label: "ملغى",                    cls: "bg-red-50 text-red-600 border border-red-200",         icon: AlertCircle  },
  REJECTED:                    { label: "مرفوض",                   cls: "bg-gray-100 text-gray-500 border border-gray-200",     icon: AlertCircle  },
};

const STATUS_FILTER_OPTIONS = [
  { value: "all",                         label: "الكل" },
  { value: "PENDING_ADMIN_REVISION",       label: "قيد المراجعة" },
  { value: "OPEN_FOR_BIDDING",             label: "مفتوح للعروض" },
  { value: "BIDS_RECEIVED",               label: "عروض واردة" },
  { value: "ORDER_PAID_PENDING_DELIVERY",  label: "ينتظر التوصيل" },
  { value: "CLOSED_SUCCESS",              label: "مكتمل" },
  { value: "CLOSED_CANCELLED",            label: "ملغى" },
];

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, cls: "bg-gray-100 text-gray-500 border border-gray-200", icon: Circle };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-semibold whitespace-nowrap ${cfg.cls}`}>
      <Icon size={8} className="hidden sm:block" />
      <Icon size={6} className="sm:hidden" />
      {cfg.label}
    </span>
  );
}

export default function AdminRequestsPage() {
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: requests, loading } = useAsyncData<Request[]>(
    () => apiFetch("/api/admin/requests", "ADMIN"),
    []
  );

  const filtered = useMemo(() => (requests ?? []).filter(r => {
    const q = search.toLowerCase();
    const matchSearch = r.title?.toLowerCase().includes(q) || r.client?.fullName?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  }), [requests, search, statusFilter]);

  const counts = useMemo(() => ({
    total:    requests?.length ?? 0,
    open:     requests?.filter(r => r.status === "PENDING_ADMIN_REVISION" || r.status === "OPEN_FOR_BIDDING").length ?? 0,
    active:   requests?.filter(r => r.status === "BIDS_RECEIVED" || r.status === "ORDER_PAID_PENDING_DELIVERY").length ?? 0,
    done:     requests?.filter(r => r.status === "CLOSED_SUCCESS").length ?? 0,
    cancelled:requests?.filter(r => r.status === "CLOSED_CANCELLED" || r.status === "REJECTED").length ?? 0,
  }), [requests]);

  return (
    <div className="space-y-6 min-h-screen" dir="rtl">

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">الطلبات والعمليات</h1>
          <p className="text-sm text-gray-500 mt-2">إدارة ومتابعة جميع طلبات المنصة بكفاءة</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
            {loading ? "—" : `${counts.total} طلب`}
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {[
          { label: "الإجمالي",      count: counts.total,     icon: Package,      color: "from-gray-50 to-white",     iconBg: "bg-gray-100",    iconColor: "text-gray-700",   accentBg: "bg-gray-100",   accentBorder: "border-gray-200"   },
          { label: "مفتوح",         count: counts.open,      icon: Clock,        color: "from-amber-50 to-white",   iconBg: "bg-amber-100",   iconColor: "text-amber-700",  accentBg: "bg-amber-100",  accentBorder: "border-amber-200"  },
          { label: "نشط",           count: counts.active,    icon: Zap,          color: "from-blue-50 to-white",    iconBg: "bg-blue-100",    iconColor: "text-blue-700",   accentBg: "bg-blue-100",   accentBorder: "border-blue-200"   },
          { label: "مكتمل",         count: counts.done,      icon: CheckCircle,  color: "from-green-50 to-white",   iconBg: "bg-green-100",   iconColor: "text-green-700",  accentBg: "bg-green-100",  accentBorder: "border-green-200"  },
          { label: "ملغى",          count: counts.cancelled, icon: XCircle,      color: "from-red-50 to-white",     iconBg: "bg-red-100",     iconColor: "text-red-700",    accentBg: "bg-red-100",    accentBorder: "border-red-200"    },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br ${s.color} shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300 p-5 flex flex-col justify-between min-h-[140px] group`}
            >
              {/* Accent line */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${s.accentBg}`} />
              
              {/* Icon */}
              <div className={`${s.iconBg} w-10 h-10 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={20} className={`${s.iconColor}`} strokeWidth={2} />
              </div>

              {/* Content */}
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-2 uppercase tracking-wide">{s.label}</p>
                <p className="text-3xl md:text-4xl font-black text-gray-900 tabular-nums leading-none">
                  {loading ? "—" : s.count.toLocaleString("ar-EG")}
                </p>
              </div>

              {/* Animated accent */}
              <div className={`absolute -bottom-8 -right-8 w-24 h-24 ${s.accentBg} opacity-10 rounded-full group-hover:opacity-20 transition-opacity duration-300`} />
            </div>
          );
        })}
      </div>

      {/* Filter & Search Section */}
      <div className="space-y-4 bg-white rounded-2xl border border-gray-200 p-5 md:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث بعنوان الطلب أو اسم العميل..."
              className="w-full h-11 bg-white border border-gray-200 rounded-lg pr-10 pl-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-11 bg-white border border-gray-200 rounded-lg px-4 text-sm text-gray-900 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all font-medium"
          >
            {STATUS_FILTER_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Active Filters Display */}
        {(search || statusFilter !== "all") && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-gray-500">الفلاتر النشطة:</span>
            {search && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg">
                <span className="text-xs font-medium text-orange-700">{search}</span>
                <button
                  onClick={() => setSearch("")}
                  className="text-orange-400 hover:text-orange-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            )}
            {statusFilter !== "all" && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-xs font-medium text-blue-700">
                  {STATUS_FILTER_OPTIONS.find(o => o.value === statusFilter)?.label}
                </span>
                <button
                  onClick={() => setStatusFilter("all")}
                  className="text-blue-400 hover:text-blue-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">رقم الطلب</th>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">العنوان</th>
                <th className="hidden sm:table-cell px-4 md:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">العميل</th>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">الحالة</th>
                <th className="hidden md:table-cell px-4 md:px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">التاريخ</th>
                <th className="px-4 md:px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td colSpan={6} className="px-4 md:px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded-md animate-pulse" style={{ width: `${40 + i * 6}%` }} />
                      </td>
                    </tr>
                  ))
                : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} className="px-4 md:px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                            <Package className="text-gray-300" size={28} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-700 mb-1">لا توجد طلبات مطابقة</h3>
                            <p className="text-sm text-gray-500">حاول تعديل الفلاتر أو البحث</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                  : filtered.map((req, idx) => (
                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer border-b last:border-0">
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-xs">
                            {idx + 1}
                          </div>
                          <span className="font-mono text-sm font-semibold text-gray-700">#{req.id}</span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <p className="font-semibold text-gray-900 text-sm truncate max-w-xs group-hover:text-orange-600 transition-colors">
                          {req.title}
                        </p>
                      </td>
                      <td className="hidden sm:table-cell px-4 md:px-6 py-4 text-sm text-gray-600">
                        {req.client?.fullName || "—"}
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <StatusPill status={req.status} />
                      </td>
                      <td className="hidden md:table-cell px-4 md:px-6 py-4 text-sm text-gray-500">
                        {formatDate(req.createdAt)}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-center">
                        <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100">
                          <ChevronLeft size={16} className="rotate-180" />
                        </button>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Stats */}
      {!loading && filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-600">
          <p>
            عرض <span className="font-bold text-gray-900">{filtered.length}</span> من{" "}
            <span className="font-bold text-gray-900">{counts.total}</span> طلب
          </p>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>مكتمل: {counts.done}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>نشط: {counts.active}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
