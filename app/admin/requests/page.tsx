"use client";

import { useState, useMemo } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatDate, formatCurrency } from "@/lib/formatters";
import {
  Search, RefreshCw,
  Truck, CheckCircle2,
  X, Calendar, User, Phone,
  History, Box, ArrowUpRight, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OrderRequest {
  id: number;
  title: string;
  status: string;
  total: number;
  createdAt: string;
  client?: { fullName?: string; phone?: string };
  items: unknown[];
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
    <div className="min-h-full bg-slate-50 pb-20 font-sans text-right" dir="rtl">
      
      {/* 🚀 Header: Professional Control */}
      <section className="bg-white border-b border-slate-200 sticky top-0 z-40 overflow-hidden">
        <div className="px-6 lg:px-10 py-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-1">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">نظام إدارة الطلبات</span>
             </div>
             <h1 className="text-2xl font-bold tracking-tight text-slate-900 border-r-4 border-orange-500 pr-4">سجل <span className="text-orange-600">الطلبات</span></h1>
             <p className="text-sm text-slate-500 font-medium max-w-xl">متابعة فورية لجميع الطلبات الصادرة، مراجعة حالات التوصيل، وحل مشكلات الشحنات.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
             <div className="relative group w-full sm:w-[400px]">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-all" size={18} />
                <input
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   placeholder="بحث برقم الطلب أو اسم العميل..."
                   className="w-full pr-12 pl-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:border-orange-500 outline-none transition-all placeholder:text-slate-400"
                />
             </div>
             <button onClick={() => refresh()} className="p-3 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-orange-600 hover:border-orange-200 transition-all">
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
             </button>
          </div>
        </div>
      </section>

      <div className="px-6 lg:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           
           {/* 📋 Order Ledger */}
           <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[600px]">
              <div className="overflow-x-auto">
                 <table className="w-full text-right">
                    <thead>
                       <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">الطلب</th>
                          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-center text-slate-500">الحالة</th>
                          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">المرسل إليه</th>
                          <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-left text-slate-500">المبلغ</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {loading ? (
                         [1,2,3,4,5,6].map(i => <tr key={i} className="animate-pulse"><td colSpan={4} className="h-20 bg-slate-50/50" /></tr>)
                       ) : filtered.length === 0 ? (
                         <tr><td colSpan={4} className="py-20 text-center text-slate-400 font-medium">لا توجد طلبات تطابق بحثك</td></tr>
                       ) : filtered.map(req => (
                         <tr 
                          key={req.id} 
                          onClick={() => setSelected(req)}
                          className={`group cursor-pointer transition-all ${selected?.id === req.id ? 'bg-orange-50/50' : 'hover:bg-slate-50'}`}
                         >
                            <td className="px-6 py-5">
                               <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${selected?.id === req.id ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-600'}`}>
                                     <Box size={20} />
                                  </div>
                                  <div>
                                     <p className="text-sm font-bold text-slate-900 leading-tight">#{req.id}</p>
                                     <p className="text-[10px] font-medium text-slate-400 mt-1">{formatDate(req.createdAt)}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-5 text-center">
                               <StatusBadge status={req.status} />
                            </td>
                            <td className="px-6 py-5">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-[10px]">{req.client?.fullName?.charAt(0) || "U"}</div>
                                  <span className="text-sm font-semibold text-slate-700">{req.client?.fullName || "عميل النظام"}</span>
                               </div>
                            </td>
                            <td className="px-6 py-5 text-left font-jakarta text-lg font-bold text-slate-900 tracking-tight">
                               {formatCurrency(req.total)}
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* 🛡️ Order Inspector */}
           <AnimatePresence mode="wait">
              {selected ? (
                 <motion.aside
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="lg:col-span-4 bg-white rounded-2xl p-8 border border-slate-200 shadow-xl sticky top-32 overflow-hidden"
                 >
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
                       <h2 className="text-lg font-bold text-slate-900">تفاصيل الشحنة</h2>
                       <button onClick={() => setSelected(null)} className="p-2 bg-slate-100 hover:bg-rose-100 hover:text-rose-600 rounded-lg text-slate-400 transition-all"><X size={18} /></button>
                    </div>

                    <div className="space-y-6">
                       <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">الحالة اللوجستية</p>
                          <div className="flex flex-col gap-3">
                             <h3 className="text-xl font-bold leading-tight text-slate-900">{selected.title}</h3>
                             <StatusBadge status={selected.status} large />
                          </div>
                       </div>

                       {/* 🧠 AI Audit Reasoning Display */}
                       {selected.status === 'PENDING_ADMIN_REVISION' && (
                          <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                             <div className="flex items-center gap-2 text-amber-800 text-xs font-bold">
                                <Zap size={16} /> نتائج تدقيق المحتوى (AI Watchtower)
                             </div>
                             <p className="text-xs text-amber-700 leading-relaxed font-medium">
                                {(selected as any).notes || "لا توجد ملاحظات آلية متوفرة لهذا الطلب."}
                             </p>
                          </div>
                       )}

                       <div className="space-y-3">
                          <DetailRow icon={<User size={16} />} label="صاحب الطلب" value={selected.client?.fullName || 'غير محدد'} />
                          <DetailRow icon={<Phone size={16} />} label="هاتف التواصل" value={selected.client?.phone || 'غير مسجل'} />
                          <DetailRow icon={<Calendar size={16} />} label="توقيت الإنشاء" value={formatDate(selected.createdAt)} />
                          <DetailRow icon={<ArrowUpRight size={16} />} label="القيمة الإجمالية" value={formatCurrency(selected.total)} highlight />
                       </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-100 space-y-3">
                       {selected.status === 'PENDING_ADMIN_REVISION' ? (
                          <div className="grid grid-cols-2 gap-3">
                             <button 
                               onClick={async () => {
                                 await apiFetch(`/api/admin/requests/${selected.id}/review`, "ADMIN", { method: 'PATCH', body: { action: 'approve' } });
                                 refresh();
                                 setSelected(null);
                               }}
                               className="h-12 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                             >
                                <CheckCircle2 size={16} /> موافقة
                             </button>
                             <button 
                               onClick={async () => {
                                 await apiFetch(`/api/admin/requests/${selected.id}/review`, "ADMIN", { method: 'PATCH', body: { action: 'reject' } });
                                 refresh();
                                 setSelected(null);
                               }}
                               className="h-12 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
                             >
                                <X size={16} /> رفض الطلب
                             </button>
                          </div>
                       ) : (
                          <>
                             <button className="w-full h-14 bg-orange-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                                <Truck size={20} /> تحديث مسار التوصيل
                             </button>
                             <button className="w-full h-12 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                                <History size={16} /> عرض سجل التغييرات
                             </button>
                          </>
                       )}
                    </div>
                 </motion.aside>
              ) : (
                <div className="lg:col-span-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-20 flex flex-col items-center justify-center text-center gap-4 text-slate-400">
                   <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <Box size={32} />
                   </div>
                   <p className="text-sm font-medium">اختر طلباً من القائمة لعرض تفاصيله بالكامل</p>
                </div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, large }: { status: string; large?: boolean }) {
  const statusMap: Record<string, { label: string; cls: string }> = {
    "PENDING_ADMIN_REVISION": { label: "في انتظار المراجعة", cls: "bg-amber-100 text-amber-700 border-amber-200" },
    "OPEN_FOR_BIDDING": { label: "مفتوح للمزايدة", cls: "bg-sky-100 text-sky-700 border-sky-200" },
    "OFFERS_FORWARDED": { label: "تم إرسال العروض", cls: "bg-blue-100 text-blue-700 border-blue-200" },
    "ORDER_PAID_PENDING_DELIVERY": { label: "تم الدفع - قيد التوصيل", cls: "bg-indigo-100 text-indigo-700 border-indigo-200" },
    "CLOSED_SUCCESS": { label: "تم التوصيل بنجاح", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    "CLOSED_CANCELLED": { label: "ملغي / مرتجع", cls: "bg-rose-100 text-rose-700 border-rose-200" },
    "default": { label: status, cls: "bg-slate-100 text-slate-500 border-slate-200" }
  };

  const { label, cls } = statusMap[status] || statusMap.default;
  return (
    <span className={`inline-flex items-center gap-2 rounded-lg border font-bold transition-all ${cls} ${large ? 'px-6 py-3 text-base' : 'px-3 py-1 text-[10px]'}`}>
       {label}
       {(status === "CLOSED_SUCCESS" || status === "تم التوصيل") && <CheckCircle2 size={large ? 18 : 12} />}
       {(status === "قيد التحضير") && <RefreshCw size={large ? 18 : 12} className="animate-spin opacity-50" />}
    </span>
  );
}

function DetailRow({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center gap-3">
        <span className="text-slate-400">{icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-tight text-slate-400">
          {label}
        </span>
      </div>
      <span
        className={`font-jakarta text-sm font-bold ${
          highlight ? "text-orange-600" : "text-slate-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
