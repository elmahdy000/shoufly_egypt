"use client";

import { useState, useMemo } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  FiMapPin,
  FiTruck,
  FiBox,
  FiRefreshCw,
  FiX,
  FiPhone,
  FiUser,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

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

function statusMeta(status: string): { label: string; cls: string } {
  if (['قيد التوصيل', 'خارج للتوصيل'].includes(status))
    return { label: status, cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' };
  if (['قيد التحضير', 'تم الطلب', 'جاهز للاستلام'].includes(status))
    return { label: status, cls: 'bg-amber-50 text-amber-700 border border-amber-200' };
  if (['فشل التوصيل', 'متأخر'].includes(status))
    return { label: status, cls: 'bg-rose-50 text-rose-700 border border-rose-200' };
  if (['تم التسليم', 'تم الإرجاع'].includes(status))
    return { label: status, cls: 'bg-slate-100 text-slate-600 border border-slate-200' };
  return { label: status, cls: 'bg-slate-100 text-slate-500 border border-slate-200' };
}

function DetailPanel({ order, onClose }: { order: TrackingOrder; onClose: () => void }) {
  const meta = statusMeta(order.status);
  return (
    <div className="fixed inset-0 z-50 flex" dir="rtl">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <aside className="w-80 bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base">تفاصيل الطلب</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <FiX size={18} />
          </button>
        </div>
        <div className="p-5 space-y-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
              <FiBox size={18} className="text-slate-500" />
            </div>
            <div>
              <p className="font-bold text-slate-900">{order.title}</p>
              <p className="text-xs text-slate-400 mt-0.5">#{order.id}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1.5 font-medium">الحالة</p>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${meta.cls}`}>{meta.label}</span>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">المندوب</p>
            <div className="flex items-center gap-2">
              <FiTruck size={15} className="text-slate-400" />
              <span className="text-sm font-semibold text-slate-800">{order.rider}</span>
            </div>
            {order.riderPhone && (
              <div className="flex items-center gap-2">
                <FiPhone size={15} className="text-slate-400" />
                <span className="text-sm text-slate-600" dir="ltr">{order.riderPhone}</span>
              </div>
            )}
          </div>
          {order.client && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <FiUser size={14} className="text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">العميل</p>
                <p className="text-sm font-semibold text-slate-800">{order.client}</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <FiMapPin size={14} className="text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">الموقع الأخير</p>
              <p className="text-sm text-slate-700">{order.location || 'غير معروف'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
              <FiClock size={14} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">آخر تحديث</p>
              <p className="text-sm text-slate-700">
                {formatDistanceToNow(new Date(order.updatedAt), { addSuffix: true, locale: ar })}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default function AdminTrackingPage() {
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState<TrackingOrder | null>(null);

  const { data: liveOrders, loading, refresh } = useAsyncData<TrackingOrder[]>(
    () => apiFetch("/api/admin/tracking/live", "ADMIN"),
    []
  );

  const stats = useMemo(() => {
    const orders = liveOrders ?? [];
    const riders = new Set(orders.map(o => o.rider)).size;
    return {
      total: orders.length,
      riders,
      active: orders.filter(o => ['قيد التوصيل', 'خارج للتوصيل'].includes(o.status)).length,
      failed: orders.filter(o => o.status === 'فشل التوصيل').length,
    };
  }, [liveOrders]);

  const filteredOrders = useMemo(() => {
    const orders = liveOrders ?? [];
    if (filter === "ACTIVE") return orders.filter(o => ['قيد التوصيل', 'خارج للتوصيل'].includes(o.status));
    if (filter === "WAITING") return orders.filter(o => ['قيد التحضير', 'تم الطلب', 'جاهز للاستلام'].includes(o.status));
    if (filter === "FAILED") return orders.filter(o => o.status === 'فشل التوصيل');
    return orders;
  }, [liveOrders, filter]);

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">متابعة التوصيل</h1>
          <p className="text-sm text-slate-400 mt-0.5">متابعة حركة الطلبات والمناديب لحظياً</p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <FiRefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          تحديث
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'إجمالي الطلبات', value: stats.total, icon: <FiBox size={16} className="text-slate-500" />, bg: 'bg-slate-50 border-slate-200' },
          { label: 'المناديب النشطون', value: stats.riders, icon: <FiTruck size={16} className="text-blue-500" />, bg: 'bg-blue-50 border-blue-200' },
          { label: 'قيد التوصيل', value: stats.active, icon: <FiCheckCircle size={16} className="text-emerald-500" />, bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'فشل التوصيل', value: stats.failed, icon: <FiAlertCircle size={16} className="text-rose-500" />, bg: 'bg-rose-50 border-rose-200' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 flex items-center gap-3 ${s.bg}`}>
            <div className="shrink-0">{s.icon}</div>
            <div>
              <p className="text-lg font-bold text-slate-900 leading-none">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'ALL', label: 'الكل' },
          { id: 'ACTIVE', label: 'قيد التوصيل' },
          { id: 'WAITING', label: 'في الانتظار' },
          { id: 'FAILED', label: 'فشل التوصيل' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="py-3 px-5 text-xs font-semibold text-slate-500">الطلب</th>
              <th className="py-3 px-5 text-xs font-semibold text-slate-500">الحالة</th>
              <th className="py-3 px-5 text-xs font-semibold text-slate-500">المندوب</th>
              <th className="py-3 px-5 text-xs font-semibold text-slate-500 hidden sm:table-cell">الموقع</th>
              <th className="py-3 px-5 text-xs font-semibold text-slate-500 hidden md:table-cell">آخر تحديث</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                  <FiRefreshCw size={20} className="animate-spin mx-auto mb-2 text-slate-300" />
                  جاري التحميل...
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">لا توجد طلبات</td>
              </tr>
            ) : filteredOrders.map(order => {
              const meta = statusMeta(order.status);
              return (
                <tr
                  key={order.id}
                  onClick={() => setSelected(order)}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                        <FiBox size={16} className="text-slate-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{order.title}</p>
                        <p className="text-[10px] text-slate-400">#{order.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${meta.cls}`}>{meta.label}</span>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <FiTruck size={14} className="text-slate-400 shrink-0" />
                      <span className="text-sm text-slate-700 font-medium">{order.rider}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <FiMapPin size={14} className="text-slate-400 shrink-0" />
                      <span className="text-sm text-slate-600">{order.location || 'غير معروف'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 hidden md:table-cell">
                    <span className="text-[11px] text-slate-400">
                      {formatDistanceToNow(new Date(order.updatedAt), { addSuffix: true, locale: ar })}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && <DetailPanel order={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
