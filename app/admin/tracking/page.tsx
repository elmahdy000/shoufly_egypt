"use client";

import { ReactNode, useState, useMemo, useEffect, useCallback } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import {
  MapPin, Truck, Box, RefreshCw, X, Clock, AlertCircle,
  Navigation, Zap, Phone, User, Timer, Target, Radio, Layers, History, type LucideIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  "قيد التوصيل": { label: "جاري التوصيل", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  "خارج للتوصيل": { label: "في الطريق", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  "قيد التحضير": { label: "قيد التحضير", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
  "جاهز للاستلام": { label: "بانتظار المندوب", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
  "فشل التوصيل": { label: "تأجيل / مشكلة", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
  DEFAULT: { label: "حالة معالجة", color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-100" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.DEFAULT;
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.color.replace('text-', 'bg-')}`} />
      {cfg.label}
    </div>
  );
}

export default function AdminTrackingPage() {
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState<TrackingOrder | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: liveOrders, loading, refresh } = useAsyncData<TrackingOrder[]>(
    () => apiFetch("/api/admin/tracking/live", "ADMIN"),
    []
  );

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      refresh();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, refresh]);

  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 500);
  }, [refresh]);

  const stats = useMemo(() => {
    const orders = liveOrders ?? [];
    const activeOrders = orders.filter((o) => ["قيد التوصيل", "خارج للتوصيل"].includes(o.status));
    return {
      total: orders.length,
      riders: new Set(orders.map((o) => o.rider)).size,
      active: activeOrders.length,
      failed: orders.filter((o) => o.status === "فشل التوصيل").length,
      avgDeliveryTime: activeOrders.length > 0 ? "45 دقيقة" : "—",
      successRate: orders.length > 0 ? Math.round(((orders.length - orders.filter((o) => o.status === "فشل التوصيل").length) / orders.length) * 100) : 0,
    };
  }, [liveOrders]);

  const filteredOrders = useMemo(() => {
    const orders = liveOrders ?? [];
    if (filter === "ACTIVE") return orders.filter((o) => ["قيد التوصيل", "خارج للتوصيل"].includes(o.status));
    if (filter === "WAITING") return orders.filter((o) => ["قيد التحضير", "تم الطلب", "جاهز للاستلام"].includes(o.status));
    if (filter === "FAILED") return orders.filter((o) => o.status === "فشل التوصيل");
    return orders;
  }, [liveOrders, filter]);

  return (
    <div className="admin-page" dir="rtl">
      
      {/* 🚀 Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-3">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
              <span className="text-xs font-black text-primary tracking-wide">المراقبة المباشرة مفعلة</span>
           </div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">متابعة التوصيل</h1>
           <p className="text-slate-500 font-medium mt-2">رصد حي لحركات الأساطيل وحالات الطلبات الجارية</p>
        </div>

        <div className="flex items-center gap-3">
           <button
             onClick={() => setAutoRefresh(!autoRefresh)}
             className={`h-11 px-6 rounded-xl text-xs font-black transition-all flex items-center gap-2 border shadow-sm ${
               autoRefresh ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-white border-slate-200 text-slate-400'
             }`}
           >
              <Radio size={14} className={autoRefresh ? 'animate-pulse' : ''} />
              {autoRefresh ? 'تحديث تلقائي' : 'تحديث يدوي'}
           </button>

           <button
             onClick={handleManualRefresh}
             disabled={isRefreshing}
             className="h-11 px-6 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 shadow-sm hover:border-primary transition-all flex items-center gap-2"
           >
              <RefreshCw size={16} className={`${isRefreshing ? "animate-spin" : ""} text-primary`} />
              تحديث حي
           </button>
        </div>
      </div>

      {/* 📊 Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
         <StatCard label="إجمالي الشحن" val={stats.total} icon={Layers} color="text-slate-900" bg="bg-slate-50" />
         <StatCard label="المناديب الجارية" val={stats.riders} icon={Truck} color="text-orange-600" bg="bg-orange-50" />
         <StatCard label="طلبات نشطة" val={stats.active} icon={Zap} color="text-primary" bg="bg-primary/5" />
         <StatCard label="مشكلات رصدت" val={stats.failed} icon={AlertCircle} color="text-rose-600" bg="bg-rose-50" />
         <StatCard label="معدل النجاح" val={`${stats.successRate}%`} icon={Target} color="text-emerald-600" bg="bg-emerald-50" />
         <StatCard label="وقت التوصيل" val={stats.avgDeliveryTime} icon={Timer} color="text-amber-600" bg="bg-amber-50" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
         <div className="flex-1 w-full space-y-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
                  {["ALL", "ACTIVE", "WAITING", "FAILED"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilter(t)}
                      className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                        filter === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {t === "ALL" ? "الكل" : t === "ACTIVE" ? "نشط" : t === "WAITING" ? "انتظار" : "مشاكل"}
                    </button>
                  ))}
               </div>
            </div>

            <div className="glass-card overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="data-table">
                     <thead>
                        <tr>
                           <th>الشحنة</th>
                           <th className="text-center">الحالة</th>
                           <th>المندوب</th>
                           <th className="text-center">آخر تحديث</th>
                        </tr>
                     </thead>
                     <tbody>
                        {loading ? (
                           [1,2,3,4,5].map(i => <tr key={i} className="animate-pulse"><td colSpan={4} className="h-16 bg-slate-50/50" /></tr>)
                        ) : filteredOrders.length === 0 ? (
                           <tr><td colSpan={4} className="py-20 text-center text-slate-400 font-bold italic">لا توجد تحركات مسجلة حالياً</td></tr>
                        ) : (
                           filteredOrders.map(order => (
                              <tr key={order.id} className={`group cursor-pointer ${selected?.id === order.id ? 'bg-orange-50/50' : ''}`} onClick={() => setSelected(order)}>
                                 <td>
                                    <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform shadow-sm">
                                          <Box size={18} />
                                       </div>
                                       <div>
                                          <p className="text-xs font-bold text-slate-900 leading-none mb-1.5 truncate max-w-[200px]">{order.title}</p>
                                          <span className="text-xs font-black text-slate-400 tracking-tighter">ID_{order.id}</span>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="text-center"><StatusBadge status={order.status} /></td>
                                 <td>
                                    <div className="flex items-center gap-2 font-bold text-xs text-slate-700">
                                       <Truck size={14} className="text-primary" />
                                       {order.rider}
                                    </div>
                                 </td>
                                 <td className="text-center text-xs font-bold text-slate-400 tabular-nums">
                                    {formatDistanceToNow(new Date(order.updatedAt), { addSuffix: true, locale: ar })}
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>

         {/* Monitoring Inspector */}
         <AnimatePresence>
            {selected && (
               <motion.aside
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  className="w-full lg:w-[420px] glass-card p-8 sticky top-24 space-y-8"
               >
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner"><Navigation size={24} /></div>
                        <div>
                           <h2 className="text-lg font-bold text-slate-900">تحليل المراقبة</h2>
                           <p className="text-xs text-slate-400 font-black tracking-wide">عرض الحالة</p>
                        </div>
                     </div>
                     <button onClick={() => setSelected(null)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><X size={18} /></button>
                  </div>

                  <div className="p-6 bg-slate-900 rounded-[28px] text-white">
                     <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-0.5 bg-white/10 rounded-lg text-xs font-black">ID_{selected.id}</span>
                        <StatusBadge status={selected.status} />
                     </div>
                     <h4 className="text-xl font-black tracking-tight leading-tight">{selected.title}</h4>
                  </div>

                  <div className="space-y-4">
                     <p className="text-xs font-black text-slate-400 tracking-wide mr-2">مسار التوصيل</p>
                     <div className="space-y-4 pr-3 border-r-2 border-slate-100 mr-2">
                        <TimelineStep label="تم استلام الطلب" active />
                        <TimelineStep label="جاري التحضير" active />
                        <TimelineStep label="خرج للتوصيل" active={selected.status !== 'قيد التحضير'} />
                        <TimelineStep label="تم التوصيل" active={selected.status === 'تم التوصيل'} />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <InfoBox icon={<Truck size={14} className="text-primary" />} label="المندوب" val={selected.rider} />
                     <InfoBox icon={<User size={14} className="text-amber-500" />} label="العميل" val={selected.client || 'غير محدد'} />
                     <InfoBox icon={<MapPin size={14} className="text-primary" />} label="الموقع" val={selected.location || "غير محدد"} />
                     <InfoBox icon={<Clock size={14} className="text-amber-500" />} label="آخر نشاط" val={formatDistanceToNow(new Date(selected.updatedAt), { addSuffix: true, locale: ar })} />
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex gap-3">
                     <button className="flex-1 h-12 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                        <Phone size={14} /> اتصال بالمندوب
                     </button>
                     <button className="flex-1 h-12 bg-slate-50 text-slate-400 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                        <History size={14} /> السجل
                     </button>
                  </div>
               </motion.aside>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
}

function StatCard({
  label,
  val,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  val: string | number;
  icon: LucideIcon;
  color: string;
  bg: string;
}) {
  return (
    <div className="glass-card p-6 flex flex-col gap-4 group">
       <div className={`w-11 h-11 ${bg} ${color} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
          <Icon size={20} />
       </div>
       <div>
          <p className="text-xs font-bold text-slate-400 tracking-wide mb-1">{label}</p>
          <p className="text-xl font-black text-slate-900 tracking-tight">{val}</p>
       </div>
    </div>
  );
}

function TimelineStep({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-4">
       <div className={`w-3 h-3 rounded-full relative z-10 -mr-[7px] border-2 bg-white ${active ? 'border-primary' : 'border-slate-200'}`} />
       <span className={`text-xs font-bold ${active ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
    </div>
  );
}

function InfoBox({ icon, label, val }: { icon: ReactNode; label: string; val: string }) {
  return (
    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-50 space-y-1 group hover:border-slate-200 transition-colors">
       <div className="flex items-center gap-2 text-slate-400 mb-1">
          {icon}
          <span className="text-xs font-bold tracking-wide">{label}</span>
       </div>
       <p className="text-xs font-bold text-slate-700 truncate">{val}</p>
    </div>
  );
}

