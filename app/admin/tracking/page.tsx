"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Truck, RefreshCw, Phone, MapPin, Clock, CheckCircle, AlertCircle, Package } from "lucide-react";

interface TrackingOrder {
  id: number;
  title: string;
  status: string;
  rider: string;
  riderPhone?: string;
  client?: string;
  location?: string;
  updatedAt: string;
}

const STATUS_MAP: Record<string, { label: string; cls: string; dot: string }> = {
  "قيد التوصيل":    { label: "جاري التوصيل",        cls: "bg-green-50 text-green-700 border-green-200",  dot: "bg-green-500" },
  "خارج للتوصيل":   { label: "في الطريق",            cls: "bg-green-50 text-green-700 border-green-200",  dot: "bg-green-500" },
  "قيد التحضير":    { label: "قيد التحضير",           cls: "bg-amber-50 text-amber-700 border-amber-200",  dot: "bg-amber-500" },
  "جاهز للاستلام":  { label: "بانتظار المندوب",       cls: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  "فشل التوصيل":    { label: "فشل التوصيل",           cls: "bg-red-50 text-red-700 border-red-200",        dot: "bg-red-500" },
};
const DEFAULT_STATUS = { label: "قيد المعالجة", cls: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-400" };

const FILTERS = [
  { key: "ALL",     label: "الكل" },
  { key: "ACTIVE",  label: "جاري التوصيل" },
  { key: "WAITING", label: "بانتظار المندوب" },
  { key: "FAILED",  label: "فشل التوصيل" },
];

export default function AdminTrackingPage() {
  const [filter, setFilter]           = useState("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh]  = useState(true);

  const { data: orders, loading, refresh } = useAsyncData<TrackingOrder[]>(
    () => apiFetch("/api/admin/tracking/live", "ADMIN"),
    []
  );

  useEffect(() => {
    if (!autoRefresh) return;
    const t = setInterval(refresh, 30_000);
    return () => clearInterval(t);
  }, [autoRefresh, refresh]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 600);
  }, [refresh]);

  const stats = useMemo(() => {
    const list = orders ?? [];
    return {
      total:   list.length,
      active:  list.filter(o => ["قيد التوصيل","خارج للتوصيل"].includes(o.status)).length,
      waiting: list.filter(o => ["قيد التحضير","جاهز للاستلام"].includes(o.status)).length,
      failed:  list.filter(o => o.status === "فشل التوصيل").length,
    };
  }, [orders]);

  const filtered = useMemo(() => {
    const list = orders ?? [];
    if (filter === "ACTIVE")  return list.filter(o => ["قيد التوصيل","خارج للتوصيل"].includes(o.status));
    if (filter === "WAITING") return list.filter(o => ["قيد التحضير","جاهز للاستلام"].includes(o.status));
    if (filter === "FAILED")  return list.filter(o => o.status === "فشل التوصيل");
    return list;
  }, [orders, filter]);

  return (
    <div className="p-6 space-y-6" dir="rtl">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التتبع المباشر</h1>
          <p className="text-sm text-gray-500 mt-1">رصد حي لعمليات التوصيل الجارية</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <div
              onClick={() => setAutoRefresh(v => !v)}
              className={`relative w-9 h-5 rounded-full transition-colors ${autoRefresh ? "bg-orange-500" : "bg-gray-300"}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoRefresh ? "translate-x-4" : "translate-x-0.5"}`} />
            </div>
            تحديث تلقائي
          </label>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
          >
            <RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} />
            تحديث
          </button>
        </div>
      </div>

      {/* Live Indicator */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg w-fit">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <span className="text-xs font-semibold text-green-700">مراقبة مباشرة مفعلة — يتحدث كل 30 ثانية</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "إجمالي الطلبات",   value: stats.total,   icon: Package,      cls: "text-gray-600",   bg: "bg-gray-50"   },
          { label: "جاري التوصيل",      value: stats.active,  icon: Truck,        cls: "text-green-600",  bg: "bg-green-50"  },
          { label: "بانتظار المندوب",   value: stats.waiting, icon: Clock,        cls: "text-amber-600",  bg: "bg-amber-50"  },
          { label: "فشل التوصيل",       value: stats.failed,  icon: AlertCircle,  cls: "text-red-600",    bg: "bg-red-50"    },
        ].map(({ label, value, icon: Icon, cls, bg }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center ${cls} shrink-0`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f.key
                ? "bg-orange-500 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">الطلب</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">المندوب</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">الحالة</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">الموقع</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">آخر تحديث</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : !filtered.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Truck size={22} className="text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-500">لا توجد طلبات في هذه الفئة</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(order => {
                  const st = STATUS_MAP[order.status] ?? DEFAULT_STATUS;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-900">{order.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">#{order.id} · {order.client ?? "—"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-700">{order.rider}</p>
                        {order.riderPhone && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Phone size={11} />
                            {order.riderPhone}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${st.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {order.location ? (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                            <MapPin size={12} className="text-gray-400" />
                            {order.location}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {formatDistanceToNow(new Date(order.updatedAt), { locale: ar, addSuffix: true })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
