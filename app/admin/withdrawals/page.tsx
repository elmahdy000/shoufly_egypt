"use client";

import { useState, useMemo, useCallback } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { reviewAdminWithdrawal } from "@/lib/api/transactions";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  Search, X, User, Calendar, Hash, Loader2,
  CheckCircle, XCircle, Landmark, Activity, History, ChevronLeft,
  Clock, DollarSign, RefreshCw, ShieldCheck
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  PENDING:  { label: "قيد الفحص", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
  APPROVED: { label: "تم الصرف",  color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  REJECTED: { label: "تم الرفض",    color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
};

export default function AdminWithdrawalsPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: withdrawals, loading, setData, refresh } = useAsyncData<any[]>(
    () => apiFetch("/api/admin/withdrawals", "ADMIN"), []
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 500);
  }, [refresh]);

  const filtered = useMemo(() => {
    let list = withdrawals ?? [];
    if (statusFilter !== "ALL") list = list.filter((w: any) => w.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((w: any) =>
        w.vendor?.fullName?.toLowerCase().includes(q) ||
        String(w.id).includes(q)
      );
    }
    return list;
  }, [withdrawals, statusFilter, search]);

  const stats = useMemo(() => {
    const all = withdrawals ?? [];
    return {
      total: all.length,
      pending: all.filter((w: any) => w.status === "PENDING").length,
      approved: all.filter((w: any) => w.status === "APPROVED").length,
      pendingAmount: all.filter((w: any) => w.status === "PENDING").reduce((s: number, w: any) => s + Number(w.amount), 0),
    };
  }, [withdrawals]);

  async function handleReview(id: number, action: "APPROVE" | "REJECT") {
    setActionLoading(action === "APPROVE" ? "approve" : "reject");
    setActionMsg(null);
    try {
      const note = action === "REJECT" ? (rejectNote || "تم الرفض من قبل الإدارة") : undefined;
      await reviewAdminWithdrawal(id, action, note);
      const newStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";
      setData((prev: any[] | null) => (prev ?? []).map((w) => w.id === id ? { ...w, status: newStatus, reviewNote: note } : w));
      setSelected((prev: any) => prev?.id === id ? { ...prev, status: newStatus, reviewNote: note } : prev);
      setActionMsg({ text: action === "APPROVE" ? "تم اعتماد الطلب وصرف المبلغ بنجاح ✓" : "تم تنفيذ إجراء الرفض", ok: true });
      if (action === "REJECT") setRejectNote("");
    } catch (e: any) {
      setActionMsg({ text: e.message || "فشلت العملية", ok: false });
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="admin-page" dir="rtl">
      
      {/* 🚀 Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 leading-tight">سحوبات الأموال</h1>
           <p className="text-slate-500 font-medium mt-1">مراجعة واعتماد طلبات تحويل الأرصدة للبنوك والمحافظ</p>
        </div>
        
        <div className="flex items-center gap-3">
           <button onClick={handleRefresh} className="h-11 px-6 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 shadow-sm hover:border-primary transition-all flex items-center gap-2">
              <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
              تحديث البيانات
           </button>
        </div>
      </div>

      {/* 📊 Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
         <StatItem label="بانتظار الفحص" val={stats.pending} icon={Clock} color="text-amber-600" bg="bg-amber-50" />
         <StatItem label="قيمة المعلق" val={formatCurrency(stats.pendingAmount)} icon={DollarSign} color="text-slate-900" bg="bg-slate-50" />
         <StatItem label="طلبات مكتملة" val={stats.approved} icon={CheckCircle} color="text-emerald-600" bg="bg-emerald-50" />
         <StatItem label="إجمالي الحركات" val={stats.total} icon={Activity} color="text-orange-600" bg="bg-orange-50" />
      </div>

      {/* 🛠 Toolbar */}
      <div className="flex flex-col md:flex-row gap-4">
         <div className="relative flex-1 group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم المستفيد أو رقم الطلب..."
              className="w-full pr-11 pl-4 h-11 bg-white border border-slate-200 rounded-xl text-sm focus:border-primary outline-none transition-all shadow-sm"
            />
         </div>
         <select
           value={statusFilter}
           onChange={(e) => setStatusFilter(e.target.value)}
           className="h-11 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none transition-all shadow-sm min-w-[200px]"
         >
           <option value="ALL">كل الحالات</option>
           <option value="PENDING">بانتظار الفحص</option>
           <option value="APPROVED">تم الصرف</option>
           <option value="REJECTED">مرفوض</option>
         </select>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
         <div className="flex-1 w-full glass-card overflow-hidden">
            <div className="overflow-x-auto">
               <table className="data-table">
                  <thead>
                     <tr>
                        <th>المستفيد / التاريخ</th>
                        <th className="text-center">المبلغ</th>
                        <th>الحالة</th>
                        <th className="text-center">إجراء</th>
                     </tr>
                  </thead>
                  <tbody>
                     {loading ? (
                        [1,2,3,4,5,6].map(i => <tr key={i} className="animate-pulse"><td colSpan={4} className="h-16 bg-slate-50/50" /></tr>)
                     ) : filtered.length === 0 ? (
                        <tr><td colSpan={4} className="py-20 text-center text-slate-400 font-bold italic">لا توجد طلبات سحب حالياً</td></tr>
                     ) : (
                        filtered.map((w: any) => (
                           <tr key={w.id} className={`group cursor-pointer ${selected?.id === w.id ? 'bg-orange-50/50' : ''}`} onClick={() => setSelected(w)}>
                              <td>
                                 <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                                       {w.vendor?.fullName?.charAt(0)}
                                    </div>
                                    <div>
                                       <p className="text-xs font-bold text-slate-900">{w.vendor?.fullName}</p>
                                       <p className="text-xs text-slate-400">{formatDistanceToNow(new Date(w.createdAt), { addSuffix: true, locale: ar })}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="text-center">
                                 <span className="text-sm font-black text-slate-900 tabular-nums">{formatCurrency(Number(w.amount))}</span>
                              </td>
                              <td><StatusBadge status={w.status} /></td>
                              <td className="text-center">
                                 <button className="p-2 text-slate-400 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all">
                                    <ChevronLeft size={16} />
                                 </button>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Details Sidebar */}
         <AnimatePresence>
            {selected && (
               <motion.aside
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 20, opacity: 0 }}
                  className="w-full lg:w-96 glass-card p-8 sticky top-24 space-y-8"
               >
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400"><Landmark size={20} /></div>
                        <h2 className="text-lg font-bold text-slate-900">تفاصيل السحب</h2>
                     </div>
                     <button onClick={() => setSelected(null)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><X size={18} /></button>
                  </div>

                  <div className="p-6 bg-slate-900 rounded-2xl text-white">
                     <p className="text-xs text-slate-400 font-bold tracking-wider mb-2">القيمة المطلوب صرفها</p>
                     <p className="text-3xl font-black tabular-nums">{formatCurrency(Number(selected.amount))}</p>
                     <div className="mt-4"><StatusBadge status={selected.status} /></div>
                  </div>

                  <div className="space-y-4">
                     <InfoRow icon={<User size={14} />} label="المستفيد" val={selected.vendor?.fullName} />
                     <InfoRow icon={<Hash size={14} />} label="رقم الطلب" val={`#WTH-${selected.id}`} />
                     <InfoRow icon={<Calendar size={14} />} label="تاريخ الطلب" val={formatDate(selected.createdAt)} />
                  </div>

                  {actionMsg && (
                     <div className={`p-4 rounded-xl text-xs font-bold border ${actionMsg.ok ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                        {actionMsg.text}
                     </div>
                  )}

                  <div className="pt-6 border-t border-slate-100 space-y-3">
                     {selected.status === "PENDING" && (
                        <>
                           <button 
                             onClick={() => handleReview(selected.id, "APPROVE")}
                             disabled={!!actionLoading}
                             className="w-full h-11 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                           >
                              {actionLoading === "approve" ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                              اعتماد وصرف المبلغ
                           </button>
                           
                           <div className="space-y-2">
                              <textarea
                                value={rejectNote}
                                onChange={(e) => setRejectNote(e.target.value)}
                                placeholder="اكتب سبب الرفض هنا..."
                                rows={2}
                                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:ring-1 focus:ring-rose-500 outline-none transition-all resize-none"
                              />
                              <button 
                                onClick={() => handleReview(selected.id, "REJECT")}
                                disabled={!!actionLoading}
                                className="w-full h-11 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-2"
                              >
                                 {actionLoading === "reject" ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                                 رفض هذا الطلب
                              </button>
                           </div>
                        </>
                     )}
                     <button className="w-full h-11 bg-slate-50 text-slate-400 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                        <History size={16} /> سجل التدقيق المالي
                     </button>
                  </div>
               </motion.aside>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
}

function StatItem({ label, val, icon: Icon, color, bg }: { label: string; val: any; icon: any; color: string; bg: string }) {
  return (
    <div className="glass-card p-6 flex flex-col gap-4 group">
       <div className={`w-11 h-11 ${bg} ${color} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
          <Icon size={20} />
       </div>
       <div>
          <p className="text-xs font-bold text-slate-400 tracking-wide mb-1">{label}</p>
          <p className="text-lg font-black text-slate-900 tracking-tight">{val}</p>
       </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-100" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
       <div className={`w-1.5 h-1.5 rounded-full ${cfg.color.replace('text-', 'bg-')}`} />
       {cfg.label}
    </span>
  );
}

function InfoRow({ icon, label, val }: { icon: any; label: string; val: string }) {
  return (
    <div className="p-3 bg-slate-50 rounded-xl border border-slate-50 space-y-1">
       <div className="flex items-center gap-2 text-slate-400">
          {icon}
          <span className="text-xs font-bold tracking-wider">{label}</span>
       </div>
       <p className="text-xs font-bold text-slate-700 truncate">{val}</p>
    </div>
  );
}
