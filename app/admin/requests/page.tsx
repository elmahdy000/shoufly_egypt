"use client";

import { useState, useMemo } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatDate } from "@/lib/formatters";
import { Search, Package, Clock, CheckCircle2, AlertCircle, Activity, ChevronLeft, Circle } from "lucide-react";

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
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 min-h-screen" dir="rtl">

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">الطلبات والعمليات</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">إدارة ومتابعة جميع طلبات المنصة</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {[
          { label: "الإجمالي",      count: counts.total,    bg: "bg-gray-50",     border: "border-gray-200",  text: "text-gray-900"   },
          { label: "مفتوح",         count: counts.open,     bg: "bg-amber-50",    border: "border-amber-200",  text: "text-amber-700"  },
          { label: "نشط",           count: counts.active,   bg: "bg-blue-50",     border: "border-blue-200",   text: "text-blue-700"   },
          { label: "مكتمل",         count: counts.done,     bg: "bg-green-50",    border: "border-green-200",  text: "text-green-700"  },
          { label: "ملغى",          count: counts.cancelled, bg: "bg-red-50",      border: "border-red-200",    text: "text-red-700"    },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-2.5 sm:p-3 lg:p-4 hover:shadow-md transition-shadow`}>
            <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${s.text} tabular-nums truncate`}>{loading ? "—" : s.count.toLocaleString("ar-EG")}</p>
            <p className="text-[10px] sm:text-xs text-gray-600 mt-1 font-medium truncate">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="relative">
          <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 sm:right-4" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث بعنوان أو عميل..."
            className="w-full h-9 sm:h-10 bg-white border border-gray-200 rounded-lg pr-9 sm:pr-10 pl-3 sm:pl-4 text-xs sm:text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-9 sm:h-10 bg-white border border-gray-200 rounded-lg px-3 sm:px-4 text-xs sm:text-sm text-gray-700 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
        >
          {STATUS_FILTER_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {["#", "العنوان", "العميل", "الحالة", "التاريخ"].map(h => (
                  <th key={h} className="px-2.5 sm:px-4 lg:px-6 py-2.5 sm:py-3 text-[9px] sm:text-[10px] lg:text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td colSpan={5} className="px-2.5 sm:px-4 lg:px-6 py-2.5 sm:py-3">
                        <div className="h-3 sm:h-4 bg-gray-100 rounded-md animate-pulse" style={{ width: `${40 + i * 8}%` }} />
                      </td>
                    </tr>
                  ))
                : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={5} className="px-2.5 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12 text-center text-xs sm:text-sm text-gray-400 font-medium">
                        لا توجد طلبات مطابقة
                      </td>
                    </tr>
                  )
                  : filtered.map(req => (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                      <td className="px-2.5 sm:px-4 lg:px-6 py-2.5 sm:py-3 text-[11px] sm:text-sm font-semibold text-gray-500">#{req.id}</td>
                      <td className="px-2.5 sm:px-4 lg:px-6 py-2.5 sm:py-3 text-[11px] sm:text-sm font-semibold text-gray-900 truncate max-w-[150px]">{req.title}</td>
                      <td className="hidden sm:table-cell px-2.5 sm:px-4 lg:px-6 py-2.5 sm:py-3 text-[11px] sm:text-sm text-gray-600">{req.client?.fullName || "—"}</td>
                      <td className="px-2.5 sm:px-4 lg:px-6 py-2.5 sm:py-3">
                        <StatusPill status={req.status} />
                      </td>
                      <td className="hidden md:table-cell px-2.5 sm:px-4 lg:px-6 py-2.5 sm:py-3 text-[10px] sm:text-sm text-gray-500">{formatDate(req.createdAt)}</td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 font-medium">
        <span>عرض <span className="font-bold text-gray-900">{filtered.length}</span> من <span className="font-bold text-gray-900">{counts.total}</span></span>
      </div>
    </div>
  );
}
