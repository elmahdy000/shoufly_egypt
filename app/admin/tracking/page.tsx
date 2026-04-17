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
  "قيد التوصيل": { label: "جاري التوصيل", color: "text-emerald-700", bg: "bg-emerald-100", border: "border-emerald-200" },
  "خارج للتوصيل": { label: "في الطريق", color: "text-emerald-700", bg: "bg-emerald-100", border: "border-emerald-200" },
  "تم التوصيل": { label: "تم التوصيل", color: "text-emerald-700", bg: "bg-emerald-100", border: "border-emerald-200" },
  "قيد التحضير": { label: "قيد التحضير", color: "text-amber-700", bg: "bg-amber-100", border: "border-amber-200" },
  "جاهز للاستلام": { label: "بانتظار المندوب", color: "text-orange-700", bg: "bg-orange-100", border: "border-orange-200" },
  "تم الطلب": { label: "طلب جديد", color: "text-indigo-700", bg: "bg-indigo-100", border: "border-indigo-200" },
  "فشل التوصيل": { label: "تأجيل / مشكلة", color: "text-rose-700", bg: "bg-rose-100", border: "border-rose-200" },
  DEFAULT: { label: "حالة معالجة", color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200" },
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
    <div className="min-h-full bg-slate-50 pb-20 font-sans text-right" dir="rtl">
      
      {/* 🚀 Header: Modern Tracking Hub */}
      <section className="bg-white border-b border-slate-200 sticky top-0 z-40 overflow-hidden">
        <div className="px-6 lg:px-10 py-8 relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-1">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">المراقبة المباشرة مفعلة</span>
             </div>
             <h1 className="text-2xl font-bold tracking-tight text-slate-900 border-r-4 border-emerald-500 pr-4">متابعة <span className="text-emerald-600">التوصيل</span></h1>
             <p className="text-sm text-slate-500 font-medium max-w-xl">رصد حي لحركات الأساطيل وحالات الطلبات الجارية في الميدان.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
             <button
               onClick={() => setAutoRefresh(!autoRefresh)}
               className={`h-11 px-6 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border shadow-sm ${
                 autoRefresh ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-400'
               }`}
             >
                <Radio size={14} className={autoRefresh ? 'animate-pulse' : ''} />
                {autoRefresh ? 'تحديث تلقائي مفعل' : 'تحديث يدوي'}
             </button>

             <button
               onClick={handleManualRefresh}
               disabled={isRefreshing}
               className="h-11 px-6 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 shadow-sm hover:text-emerald-600 hover:border-emerald-200 transition-all flex items-center gap-2"
             >
                <RefreshCw size={16} className={`${isRefreshing ? "animate-spin" : ""} text-emerald-500`} />
                تحديث حي
             </button>
          </div>
        </div>
      </section>

      <div className="px-6 lg:px-10 py-8 space-y-8">
        
        {/* 📊 Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
           <StatCard label="إجمالي الشحن" val={stats.total} icon={Layers} color="text-slate-600" bg="bg-slate-100" />
           <StatCard label="المناديب المتاحة" val={stats.riders} icon={Truck} color="text-orange-600" bg="bg-orange-50" />
           <StatCard label="طلبات نشطة" val={stats.active} icon={Zap} color="text-emerald-600" bg="bg-emerald-50" />
           <StatCard label="مشكلات رصدت" val={stats.failed} icon={AlertCircle} color="text-rose-600" bg="bg-rose-50" />
           <StatCard label="معدل النجاح" val={`${stats.successRate}%`} icon={Target} color="text-emerald-600" bg="bg-emerald-50" />
           <StatCard label="وقت التوصيل" val={stats.avgDeliveryTime} icon={Timer} color="text-amber-600" bg="bg-amber-50" />
        </div>

        {/* 🛠 Filter & List */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
           <div className="flex-1 w-full space-y-6">
              <div className="flex items-center justify-between bg-white border border-slate-200 p-2 rounded-xl shadow-sm">
                 <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-lg border border-slate-100">
                    {["ALL", "ACTIVE", "WAITING", "FAILED"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setFilter(t)}
                        className={`px-5 py-2 rounded-md text-[10px] font-bold transition-all uppercase tracking-wider ${
                          filter === t ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        {t === "ALL" ? "الكل" : t === "ACTIVE" ? "نشط" : t === "WAITING" ? "انتظار" : "مشاكل"}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[500px]">
                 <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                       <thead>
                          <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                             <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider">الشحنة / المعرف</th>
                             <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-center">الحالة</th>
                             <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider">المندوب</th>
                             <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-wider text-left">آخر نشاط</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {loading ? (
                             [1,2,3,4,5].map(i => <tr key={i} className="animate-pulse"><td colSpan={4} className="h-20 bg-slate-50/30" /></tr>)
                          ) : filteredOrders.length === 0 ? (
                             <tr><td colSpan={4} className="py-20 text-center text-slate-300 font-bold text-lg opacity-40">لا توجد تحركات مسجلة حالياً</td></tr>
                          ) : (
                             filteredOrders.map(order => (
                                <tr 
                                  key={order.id} 
                                  className={`group cursor-pointer transition-all ${selected?.id === order.id ? 'bg-emerald-50/50' : 'hover:bg-slate-50'}`} 
                                  onClick={() => setSelected(order)}
                                >
                                   <td className="px-8 py-5">
                                      <div className="flex items-center gap-4">
                                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all ${selected?.id === order.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-100 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600'}`}>
                                            <Box size={18} />
                                         </div>
                                         <div>
                                            <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors leading-tight">{order.title}</p>
                                            <span className="text-[10px] font-bold text-slate-400 tracking-wider">ID_{order.id}</span>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="px-8 py-5 text-center"><StatusBadge status={order.status} /></td>
                                   <td className="px-8 py-5">
                                      <div className="flex items-center gap-2 font-bold text-xs text-slate-600">
                                         <Truck size={14} className="text-emerald-500" />
                                         {order.rider}
                                      </div>
                                   </td>
                                   <td className="px-8 py-5 text-left text-[10px] font-bold text-slate-400 tabular-nums uppercase">
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

           {/* 🛡️ Monitoring Inspector */}
           <AnimatePresence>
              {selected ? (
                 <motion.aside
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="lg:col-span-4 w-full lg:w-[420px] bg-white rounded-2xl p-8 border border-slate-200 shadow-xl sticky top-28 space-y-8 overflow-hidden"
                 >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-6 text-slate-900">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm"><Navigation size={24} /></div>
                          <div>
                             <h2 className="text-lg font-bold">تحليل المراقبة</h2>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Live Tracking Active</p>
                          </div>
                       </div>
                       <button onClick={() => setSelected(null)} className="p-2 hover:bg-rose-100 rounded-lg text-slate-400 hover:text-rose-600 transition-all active:scale-95"><X size={18} /></button>
                    </div>

                    <div className="space-y-6">
                       <div className="p-6 bg-slate-900 rounded-2xl text-white relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-600/20 blur-3xl -ml-16 -mt-16" />
                          <div className="relative z-10">
                             <div className="flex items-center gap-2 mb-3">
                                <span className="px-2 py-0.5 bg-white/10 rounded-md text-[9px] font-black tracking-widest border border-white/10">SHP_ID_{selected.id}</span>
                                <StatusBadge status={selected.status} />
                             </div>
                             <h4 className="text-lg font-bold tracking-tight leading-tight">{selected.title}</h4>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">مسار التوصيل الميداني</p>
                          <div className="space-y-5 pr-4 border-r-2 border-slate-100 mr-2">
                             <TimelineStep label="تم استلام الطلب" active />
                             <TimelineStep label="جاري التحضير" active />
                             <TimelineStep label="خرج للتوصيل" active={selected.status !== 'قيد التحضير'} />
                             <TimelineStep label="تم التوصيل" active={selected.status === 'تم التوصيل'} />
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-3">
                          <InfoBox icon={<Truck size={14} className="text-emerald-500" />} label="المندوب" val={selected.rider} />
                          <InfoBox icon={<User size={14} className="text-orange-500" />} label="العميل" val={selected.client || 'غير محدد'} />
                          <InfoBox icon={<MapPin size={14} className="text-emerald-500" />} label="الموقع" val={selected.location || "غير محدد"} />
                          <InfoBox icon={<Clock size={14} className="text-orange-500" />} label="آخر نشاط" val={formatDistanceToNow(new Date(selected.updatedAt), { addSuffix: true, locale: ar })} />
                       </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 flex gap-3">
                       <button className="flex-1 h-12 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 border border-emerald-700">
                          <Phone size={14} /> اتصال بالميدان
                       </button>
                       <button className="flex-1 h-12 bg-white text-slate-400 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 hover:text-slate-600 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                          <History size={14} /> سجل التحركات
                       </button>
                    </div>
                 </motion.aside>
              ) : (
                <div className="lg:col-span-4 w-full lg:w-[420px] h-[400px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-4">
                   <Target size={48} className="opacity-20" />
                   <p className="text-sm font-medium">اختر شحنة لبدء التتبع المباشر</p>
                </div>
              )}
           </AnimatePresence>
        </div>
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
    <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col gap-4 shadow-sm hover:shadow-md transition-all group">
       <div className={`w-11 h-11 ${bg} ${color} rounded-xl flex items-center justify-center shadow-sm border border-black/5 transition-transform group-hover:scale-110`}>
          <Icon size={20} />
       </div>
       <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
          <p className="text-lg font-black text-slate-900 tracking-tight font-jakarta leading-none">{val}</p>
       </div>
    </div>
  );
}

function TimelineStep({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-4 relative">
       <div className={`w-3 h-3 rounded-full relative z-10 -mr-[7px] border-2 bg-white ${active ? 'border-emerald-500 ring-4 ring-emerald-50' : 'border-slate-200'}`} />
       <span className={`text-[11px] font-bold ${active ? 'text-slate-900' : 'text-slate-400'} uppercase tracking-tighter`}>{label}</span>
    </div>
  );
}

function InfoBox({ icon, label, val }: { icon: ReactNode; label: string; val: string }) {
  return (
    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2 group hover:border-slate-200 transition-colors shadow-inner">
       <div className="flex items-center gap-2 text-slate-400">
          {icon}
          <span className="text-[9px] font-bold tracking-widest uppercase">{label}</span>
       </div>
       <p className="text-xs font-bold text-slate-800 truncate leading-none">{val}</p>
    </div>
  );
}

