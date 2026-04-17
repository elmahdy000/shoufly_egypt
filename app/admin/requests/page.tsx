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
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${cfg.cls}`}>
      <Icon size={10} />
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
    <div className="p-6 lg:p-8 space-y-6 min-h-screen" dir="rtl">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">الطلبات والعمليات</h1>
        <p className="text-sm text-gray-500 mt-0.5">إدارة ومتابعة جميع طلبات المنصة</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "إجمالي الطلبات", count: counts.total,    bg: "bg-gray-50",   border: "border-gray-200",  color: "text-gray-900"   },
          { label: "مفتوح / قيد المراجعة", count: counts.open, bg: "bg-amber-50", border: "border-amber-200", color: "text-amber-700"  },
          { label: "نشط",           count: counts.active,   bg: "bg-blue-50",   border: "border-blue-200",  color: "text-blue-700"   },
          { label: "مكتمل",         count: counts.done,     bg: "bg-green-50",  border: "border-green-200", color: "text-green-700"  },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-4`}>
            <p className={`text-2xl font-bold ${s.color}`}>{loading ? "—" : s.count.toLocaleString("ar-EG")}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث بعنوان الطلب أو اسم العميل..."
            className="w-full h-9 bg-white border border-gray-200 rounded-lg pr-9 pl-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-9 bg-white border border-gray-200 rounded-lg px-3 text-sm text-gray-700 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
        >
          {STATUS_FILTER_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-gray-100">
                {["الطلب", "العميل", "الحالة", "التاريخ"].map(h => (
                  <th key={h} className="px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/60 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 7 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td colSpan={4} className="px-5 py-4">
                        <div className="h-4 bg-gray-100 rounded-md animate-pulse" style={{ width: `${45 + i * 7}%` }} />
                      </td>
                    </tr>
                  ))
                : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-14 text-center text-sm text-gray-400">
                        لا توجد طلبات مطابقة
                      </td>
                    </tr>
                  )
                  : filtered.map(req => (
                      <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors group">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                              <Package size={13} className="text-orange-500" />
                            </div>
                            <div>
                              <p className="text-[13px] font-semibold text-gray-900 leading-none line-clamp-1 max-w-[200px]">{req.title}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">#{req.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-[13px] text-gray-600">{req.client?.fullName ?? "—"}</td>
                        <td className="px-5 py-3.5"><StatusPill status={req.status} /></td>
                        <td className="px-5 py-3.5 text-[12px] text-gray-400 whitespace-nowrap">{formatDate(req.createdAt)}</td>
                      </tr>
                    ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              عرض <span className="font-semibold text-gray-900">{filtered.length}</span> من{" "}
              <span className="font-semibold text-gray-900">{requests?.length ?? 0}</span> طلب
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
