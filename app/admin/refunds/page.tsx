"use client";

import { FormEvent, useMemo, useState } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { refundAdminRequest } from "@/lib/api/transactions";
import {
  AlertTriangle, CheckCircle, FileText, Hash,
  Loader2, Package, RefreshCw, Search, XCircle,
} from "lucide-react";
import { motion } from "framer-motion";

type RequestStatus =
  | "PENDING_ADMIN_REVISION"
  | "OPEN_FOR_BIDDING"
  | "BIDS_RECEIVED"
  | "OFFERS_FORWARDED"
  | "ORDER_PAID_PENDING_DELIVERY"
  | "CLOSED_SUCCESS"
  | "CLOSED_CANCELLED"
  | "REJECTED";

type AdminRequest = {
  id: number;
  title: string;
  status: RequestStatus;
  client?: { fullName?: string | null } | null;
};

export default function AdminRefundsPage() {
  const [requestId, setRequestId] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data: allRequests, loading: loadingReq } = useAsyncData<AdminRequest[]>(
    () => apiFetch("/api/admin/requests", "ADMIN"),
    []
  );

  const refundable = useMemo(() => {
    const list = allRequests ?? [];
    const base = list.filter((r) => r.status === "ORDER_PAID_PENDING_DELIVERY");
    if (!search.trim()) return base;
    const q = search.toLowerCase();
    return base.filter((r) =>
      r.title?.toLowerCase().includes(q) ||
      String(r.id).includes(q) ||
      r.client?.fullName?.toLowerCase().includes(q)
    );
  }, [allRequests, search]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      const result = await refundAdminRequest(Number(requestId), reason || "استرداد يدوي من لوحة الإدارة");
      setMessage(`تم إصدار استرداد بنجاح للطلب #${result.request?.id ?? requestId} ✓`);
      setRequestId("");
      setReason("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "فشلت عملية الاسترداد");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="admin-page" dir="rtl">
      
      {/* 🚀 Simple Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 leading-tight">رد الأموال</h1>
           <p className="text-slate-500 font-medium mt-1">إدارة وتسوية طلبات استرجاع المبالغ للعملاء</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
         
         <div className="lg:col-span-2 space-y-8">
            {/* Refund Center Form */}
            <div className="glass-card overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600"><RefreshCw size={20} /></div>
                     <h2 className="text-lg font-bold text-slate-900">إصدار استرداد جديد</h2>
                  </div>
               </div>
               
               <div className="p-8 space-y-6">
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-4">
                     <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                     <p className="text-sm font-bold text-amber-800 leading-relaxed">
                        تنبيه: هذا الإجراء غير قابل للتراجع. سيتم تحويل حالة الطلب إلى ملغى فوراً بعد معالجة عملية الاسترداد المالي للعميل.
                     </p>
                  </div>

                  {message && (
                     <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-bold text-emerald-600 flex items-center gap-2">
                        <CheckCircle size={16} /> {message}
                     </div>
                  )}
                  {error && (
                     <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold text-rose-600 flex items-center gap-2">
                        <XCircle size={16} /> {error}
                     </div>
                  )}

                  <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 tracking-wide mr-2">رقم الطلب</label>
                        <div className="relative">
                           <Hash className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                           <input
                             type="number"
                             value={requestId}
                             onChange={(e) => setRequestId(e.target.value)}
                             placeholder="مثال: 4509"
                             className="w-full pr-11 pl-4 h-11 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                             required
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 tracking-wide mr-2">سبب الاسترداد</label>
                        <div className="relative">
                           <FileText className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                           <input
                             value={reason}
                             onChange={(e) => setReason(e.target.value)}
                             placeholder="اكتب السبب هنا..."
                             className="w-full pr-11 pl-4 h-11 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                           />
                        </div>
                     </div>
                     <div className="md:col-span-2 pt-2">
                        <button
                          type="submit"
                          disabled={isLoading || !requestId}
                          className="w-full h-12 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
                        >
                           {isLoading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                           تأكيد وإتمام عملية الاسترداد
                        </button>
                     </div>
                  </form>
               </div>
            </div>

            {/* 📋 Refundable Requests List */}
            <div className="glass-card overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
                  <div>
                     <h2 className="text-lg font-bold text-slate-900">الطلبات المتاحة للاسترداد</h2>
                     <p className="text-xs text-slate-500 mt-1">قائمة الطلبات المدفوعة التي لا تزال قيد التنفيذ</p>
                  </div>
                  <div className="relative">
                     <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                     <input
                       value={search}
                       onChange={(e) => setSearch(e.target.value)}
                       placeholder="ابحث..."
                       className="pr-10 pl-4 h-10 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary w-56"
                     />
                  </div>
               </div>
               
               <div className="overflow-x-auto">
                  <table className="data-table">
                     <thead>
                        <tr>
                           <th>الطلب</th>
                           <th className="hidden md:table-cell">العميل</th>
                           <th className="text-center">إجراء</th>
                        </tr>
                     </thead>
                     <tbody>
                        {loadingReq ? (
                           [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan={3} className="h-16 bg-slate-50/50" /></tr>)
                        ) : refundable.length === 0 ? (
                           <tr><td colSpan={3} className="py-16 text-center text-slate-400 italic font-bold">لا توجد طلبات قابلة للاسترداد</td></tr>
                        ) : (
                           refundable.map(r => (
                              <tr key={r.id}>
                                 <td>
                                    <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400"><Package size={14} /></div>
                                       <div>
                                          <p className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{r.title}</p>
                                          <p className="text-xs text-slate-400">#{r.id}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="hidden md:table-cell text-xs text-slate-600 font-medium">{r.client?.fullName}</td>
                                 <td className="text-center">
                                    <button
                                      onClick={() => { setRequestId(String(r.id)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                      className="px-4 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold border border-rose-100 hover:bg-rose-600 hover:text-white transition-all"
                                    >
                                       معالجة الاسترداد
                                    </button>
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>

         {/* ⚖️ Guidelines */}
         <div className="space-y-6">
            <div className="glass-card p-6 space-y-6 sticky top-24">
               <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">سياسات وإرشادات الاسترداد</h3>
               <div className="space-y-4">
                  <Guideline color="bg-orange-500" label="الطلبات المدفوعة فقط" text="يمكنك رد الأموال للطلبات التي قام العميل بسداد قيمتها مسبقاً بنجاح." />
                  <Guideline color="bg-orange-500" label="تحويل الحالة تلقائياً" text="بعد الاسترداد، سيتم تحويل حالة الطلب إلى 'ملغى' ولن يتمكن المندوب من متابعته." />
                  <Guideline color="bg-emerald-500" label="سرعة التحويل" text="تتم عملية رد الأموال لمحفظة العميل أو حسابه في النظام بشكل فوري." />
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}

function Guideline({ color, label, text }: { color: string; label: string; text: string }) {
  return (
    <div className="space-y-1">
       <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
          <span className="text-sm font-bold text-slate-900">{label}</span>
       </div>
       <p className="text-xs text-slate-500 tracking-tight leading-relaxed lg:mr-3">{text}</p>
    </div>
  );
}
