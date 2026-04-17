"use client";

import { useState, useMemo } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatDate, formatCurrency } from "@/lib/formatters";
import {
  Package, Search, Filter, RefreshCw,
  Eye, Truck, CheckCircle2, AlertCircle,
  X, MapPin, Calendar, User, Phone,
  ChevronLeft, History, Box, ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OrderRequest {
  id: number;
  title: string;
  status: string;
  total: number;
  createdAt: string;
  client?: { fullName?: string; phone?: string };
  items: any[];
}

export default function AdminRequestsPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<OrderRequest | null>(null);

  const { data: requests, loading, refresh } = useAsyncData<OrderRequest[]>(
    () => apiFetch("/api/admin/requests", "ADMIN"),
    []
  );

  const filtered = useMemo(() => {
    return (requests ?? []).filter(r => 
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.client?.fullName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [requests, search]);

  return (
    <div className="min-h-full bg-[#F1F5F9] pb-32 font-sans text-right" dir="rtl">
      
      {/* 🚀 Header: Tactical Control */}
      <section className="bg-slate-950 text-white border-b-8 border-emerald-500 sticky top-0 z-40 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] -mr-40 -mt-40 opacity-50" />
        <div className="w-full px-8 lg:px-12 py-10 relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                <span className="text-[11px] font-black tracking-[0.4em] text-emerald-400 uppercase">نظام إدارة تدفقات اللوجستيات</span>
             </div>
             <h1 className="text-4xl lg:text-5xl font-black tracking-tighter">سجل <span className="text-emerald-400 italic">الطلبات</span></h1>
             <p className="text-lg text-slate-400 font-bold max-w-2xl leading-relaxed">متابعة فورية لجميع الطلبات الصادرة، مراجعة حالات التوصيل، وحل مشكلات الشحنات.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
             <div className="relative group w-full sm:w-[500px]">
                <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-all" size={24} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="بحث برقم الطلب أو اسم العميل..."
                  className="w-full pr-16 pl-6 h-16 bg-white/10 border-4 border-white/10 rounded-2xl text-xl font-bold text-white focus:bg-white focus:text-slate-950 focus:border-emerald-600 outline-none transition-all placeholder:text-slate-600"
                />
             </div>
          </div>
        </div>
      </section>

      <div className="w-full px-8 lg:px-12 py-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
           
           {/* 📋 Order Ledger: High Contrast / Large Detail */}
           <div className="lg:col-span-8 bg-white border-4 border-slate-950 rounded-[3rem] shadow-[25px_25px_0px_rgba(15,23,42,0.04)] overflow-hidden font-bold">
              <div className="overflow-x-auto">
                 <table className="w-full text-right">
                    <thead>
                       <tr className="bg-slate-50 border-b-4 border-slate-100 italic">
                          <th className="px-10 py-8 text-xs font-black uppercase tracking-widest text-slate-500">الطلب</th>
                          <th className="px-10 py-8 text-xs font-black uppercase tracking-widest text-center text-slate-500">الحالة</th>
                          <th className="px-10 py-8 text-xs font-black uppercase tracking-widest text-slate-500">المرسل إليه</th>
                          <th className="px-10 py-8 text-xs font-black uppercase tracking-widest text-left text-slate-500">المبلغ</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-slate-50">
                       {loading ? (
                         [1,2,3,4,5].map(i => <tr key={i} className="animate-pulse"><td colSpan={4} className="h-28 bg-slate-50/50" /></tr>)
                       ) : filtered.map(req => (
                         <tr 
                          key={req.id} 
                          onClick={() => setSelected(req)}
                          className={`group cursor-pointer transition-all ${selected?.id === req.id ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
                         >
                            <td className="px-10 py-8">
                               <div className="flex items-center gap-6">
                                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${selected?.id === req.id ? 'bg-slate-950 text-white rotate-6' : 'bg-slate-100 text-slate-400 group-hover:rotate-6 group-hover:bg-slate-950 group-hover:text-white'}`}>
                                     <Box size={32} />
                                  </div>
                                  <div>
                                     <p className="text-xl font-black text-slate-950 leading-tight">#{req.id}</p>
                                     <p className="text-sm font-bold text-slate-400 mt-1">{formatDate(req.createdAt)}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-10 py-8 text-center">
                               <StatusBadge status={req.status} />
                            </td>
                            <td className="px-10 py-8">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-xs">{req.client?.fullName?.charAt(0) || "U"}</div>
                                  <span className="text-base font-black text-slate-700">{req.client?.fullName || "عميل النظام"}</span>
                               </div>
                            </td>
                            <td className="px-10 py-8 text-left font-jakarta text-2xl font-black text-slate-950 tracking-tighter italic">
                               {formatCurrency(req.total)}
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* 🛡️ Order Inspector: Heavy Duty Detail Panel */}
           <AnimatePresence mode="wait">
              {selected && (
                 <motion.aside
                    initial={{ x: 60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 60, opacity: 0 }}
                    className="lg:col-span-4 bg-slate-950 rounded-[4rem] p-12 shadow-3xl text-white sticky top-40 border-l-8 border-emerald-500 overflow-hidden"
                 >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[150px] -mr-48 -mt-48" />
                    
                    <div className="flex items-center justify-between relative z-10 mb-12">
                       <h2 className="text-3xl font-black tracking-tight">تفاصيل الشحنة</h2>
                       <button onClick={() => setSelected(null)} className="p-5 bg-white/5 hover:bg-rose-500 rounded-3xl text-white transition-all shadow-xl"><X size={32} /></button>
                    </div>

                    <div className="space-y-10 relative z-10">
                       <div className="p-10 bg-white/5 border-2 border-white/10 rounded-[3.5rem] space-y-6">
                          <p className="text-[12px] font-black text-white/30 uppercase tracking-[0.4em]">الحالة اللوجستية</p>
                          <div className="flex flex-col gap-4">
                             <h3 className="text-4xl font-black leading-tight italic underline decoration-emerald-500 underline-offset-[10px]">{selected.title}</h3>
                             <StatusBadge status={selected.status} large />
                          </div>
                       </div>

                       <div className="grid grid-cols-1 gap-6">
                          <DetailBox icon={<User size={24} />} label="صاحب الطلب" value={selected.client?.fullName || 'غير محدد'} />
                          <DetailBox icon={<Phone size={24} />} label="هاتف التواصل" value={selected.client?.phone || 'غير مسجل'} />
                          <DetailBox icon={<Calendar size={24} />} label="توقيت الإنشاء" value={formatDate(selected.createdAt)} />
                          <DetailBox icon={<ArrowUpRight size={24} />} label="القيمة الإجمالية" value={formatCurrency(selected.total)} highlight />
                       </div>
                    </div>

                    <div className="pt-12 border-t-8 border-white/5 space-y-6 relative z-10">
                       <button className="w-full h-24 bg-emerald-500 text-slate-950 rounded-[2.5rem] font-black text-2xl border-4 border-slate-950 shadow-3xl hover:translate-y-[-4px] transition-all active:scale-95 flex items-center justify-center gap-6 uppercase tracking-tighter">
                          <Truck size={36} /> تحديث مسار التوصيل
                       </button>
                       <button className="w-full h-16 bg-white/5 text-white/40 rounded-[1.5rem] font-black text-xs hover:text-white transition-all flex items-center justify-center gap-4 uppercase tracking-[0.2em]">
                          <History size={20} /> عرض سجل التغييرات
                       </button>
                    </div>
                 </motion.aside>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, large }: { status: string; large?: boolean }) {
  const configs: any = {
    "PENDING_ADMIN_REVISION": "bg-amber-500 text-slate-950 border-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.3)]",
    "OPEN_FOR_BIDDING": "bg-sky-500 text-white border-slate-950",
    "قيد التوصيل": "bg-emerald-500 text-white border-slate-950",
    "قيد التحضير": "bg-amber-400 text-slate-950 border-slate-950",
    "جاهز للاستلام": "bg-indigo-500 text-white border-slate-950",
    "تم التوصيل": "bg-slate-950 text-emerald-400 border-emerald-500",
    default: "bg-slate-100 text-slate-400 border-slate-200"
  };
  const cls = configs[status] || configs.default;
  return (
    <span className={`inline-flex items-center gap-3 rounded-2xl border-4 font-black transition-all ${cls} ${large ? 'px-10 py-4 text-xl shadow-xl' : 'px-6 py-2 text-xs uppercase'}`}>
       {status}
       {status === "تم التوصيل" && <CheckCircle2 size={large ? 24 : 14} />}
       {status === "قيد التحضير" && <RefreshCw size={large ? 24 : 14} className="animate-spin text-slate-950/30" />}
    </span>
  );
}

function DetailBox({ icon, label, value, highlight }: any) {
  return (
    <div className="flex items-center justify-between p-8 bg-white/5 border-2 border-white/5 rounded-[2.5rem] group hover:border-white/20 transition-all">
       <div className="flex items-center gap-6">
          <span className="text-white/20 group-hover:text-emerald-400 transition-colors">{icon}</span>
          <span className="text-[12px] font-black text-white/30 uppercase tracking-widest">{label}</span>
       </div>
       <span className={`text-lg font-black ${highlight ? 'text-emerald-400' : 'text-white/90'} font-jakarta`}>{value}</span>
    </div>
  );
}
