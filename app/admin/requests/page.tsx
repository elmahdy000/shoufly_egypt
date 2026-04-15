"use client";

import Link from "next/link";
import { useMemo, useState, useCallback } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { reviewAdminRequest, dispatchAdminRequest } from "@/lib/api/requests";
import { formatDate } from "@/lib/formatters";
import {
  FiPackage, FiChevronLeft, FiLoader, FiMapPin, FiSearch, 
  FiTruck, FiUser, FiX, FiXCircle, FiEye, FiRefreshCw, FiZap, 
  FiShield, FiClock, FiInbox, FiCheckCircle
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

type RequestStatus =
  | "PENDING_ADMIN_REVISION"
  | "OPEN_FOR_BIDDING"
  | "BIDS_RECEIVED"
  | "OFFERS_FORWARDED"
  | "ORDER_PAID_PENDING_DELIVERY"
  | "CLOSED_SUCCESS"
  | "CLOSED_CANCELLED"
  | "REJECTED";

interface AdminRequest {
  id: number;
  title: string;
  description?: string | null;
  status: RequestStatus;
  address?: string | null;
  createdAt: string;
  client?: { fullName?: string | null } | null;
  category?: { name?: string | null } | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING_ADMIN_REVISION: { label: "مراجعة الأدمن", color: "text-amber-500", bg: "bg-amber-500/10" },
  OPEN_FOR_BIDDING: { label: "متاح للمزايدة", color: "text-amber-500", bg: "bg-amber-500/10" },
  BIDS_RECEIVED: { label: "وصلت عروض", color: "text-orange-500", bg: "bg-orange-500/10" },
  OFFERS_FORWARDED: { label: "أرسلت للعميل", color: "text-orange-500", bg: "bg-orange-500/10" },
  ORDER_PAID_PENDING_DELIVERY: { label: "بانتظار المندوب", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  CLOSED_SUCCESS: { label: "تم بنجاح", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  CLOSED_CANCELLED: { label: "تم الإلغاء", color: "text-slate-400", bg: "bg-slate-500/10" },
  REJECTED: { label: "مرفوض", color: "text-rose-500", bg: "bg-rose-500/10" },
};

export default function AdminRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AdminRequest | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: pending, refresh: refreshPending } = useAsyncData<AdminRequest[]>(() => apiFetch("/api/admin/requests/pending", "ADMIN"), []);
  const { data: all, loading: loadingAll, setData, refresh: refreshAll } = useAsyncData<AdminRequest[]>(() => apiFetch("/api/admin/requests", "ADMIN"), []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([refreshPending(), refreshAll()]);
    setTimeout(() => setIsRefreshing(false), 500);
  }, [refreshPending, refreshAll]);

  const requests = useMemo(() => (statusFilter === "PENDING" ? pending ?? [] : all ?? []), [statusFilter, pending, all]);

  const filtered = useMemo(() => {
    let list = requests;
    if (statusFilter !== "ALL" && statusFilter !== "PENDING") {
      list = list.filter((r) => r.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        r.title?.toLowerCase().includes(q) ||
        r.client?.fullName?.toLowerCase().includes(q) ||
        String(r.id).includes(q)
      );
    }
    return list;
  }, [requests, statusFilter, search]);

  const stats = useMemo(() => {
    const a = all ?? [];
    return {
      total: a.length,
      pending: pending?.length ?? 0,
      open: a.filter((r) => ["OPEN_FOR_BIDDING", "BIDS_RECEIVED", "OFFERS_FORWARDED"].includes(r.status)).length,
      paid: a.filter((r) => r.status === "ORDER_PAID_PENDING_DELIVERY").length,
    };
  }, [all, pending]);

  async function doAction(requestId: number, action: "approve" | "reject" | "dispatch") {
    setActionLoading(action);
    setActionMsg(null);
    try {
      if (action === "approve") await reviewAdminRequest(requestId, "approve");
      else if (action === "reject") await reviewAdminRequest(requestId, "reject");
      else await dispatchAdminRequest(requestId);
      const newStatus: RequestStatus = action === "approve" ? "OPEN_FOR_BIDDING" : action === "reject" ? "REJECTED" : "OPEN_FOR_BIDDING";
      setData((prev) => (prev ?? []).map((r) => (r.id === requestId ? { ...r, status: newStatus } : r)));
      setSelected((prev) => (prev?.id === requestId ? { ...prev, status: newStatus } : prev));
      setActionMsg({ text: "تم تحديث حالة الطلب بنجاح ✓", ok: true });
    } catch (e: any) {
      setActionMsg({ text: e.message || "فشلت العملية", ok: false });
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="admin-page admin-page--spacious" dir="rtl">
      
      {/* 🚀 Architectural Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-slate-100 pb-10">
        <div>
           <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-xs font-black text-slate-400 tracking-wide">تشغيل الطلبات</span>
           </div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">إدارة <span className="text-slate-300 font-light">/</span> طلبات العملاء</h1>
        </div>
        
        <button onClick={handleRefresh} className="h-11 px-6 bg-white border border-slate-200 rounded-xl text-xs font-black tracking-wide text-slate-900 shadow-sm hover:border-primary transition-all flex items-center gap-2">
           <FiRefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
           تزامن الطلبات
        </button>
      </div>

      {/* 📊 High-Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <EliteMetric label="إجمالي الطلبات" val={stats.total} icon={FiPackage} />
         <EliteMetric label="بانتظار المراجعة" val={stats.pending} icon={FiClock} accent />
         <EliteMetric label="في مرحلة المزايدة" val={stats.open} icon={FiZap} />
         <EliteMetric label="بانتظار الموقع" val={stats.paid} icon={FiTruck} />
      </div>

      {/* 🛠 Toolbar Infrastructure */}
      <div className="flex flex-col md:flex-row gap-4">
         <div className="relative flex-1 group">
            <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالعنوان، العميل أو رقم المرجع..."
              className="w-full pr-11 pl-4 h-11 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:bg-white focus:border-primary outline-none transition-all"
            />
         </div>
         <select
           value={statusFilter}
           onChange={(e) => setStatusFilter(e.target.value)}
           className="h-11 px-6 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-700 outline-none transition-all shadow-sm min-w-[220px]"
         >
           <option value="ALL">كافة مراحل الطلبات</option>
           <option value="PENDING">بانتظار مراجعة الأدمن</option>
           <option value="OPEN_FOR_BIDDING">مرحلة المزايدة الحالية</option>
           <option value="ORDER_PAID_PENDING_DELIVERY">بانتظار خدمات التوصيل</option>
         </select>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
         <div className="flex-1 w-full bg-white border border-slate-100 rounded-xl shadow-xl shadow-slate-200/20 overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-right">
                  <thead>
                     <tr className="border-b border-slate-50 bg-slate-50/50">
                        <th className="px-8 py-5 text-xs font-black text-slate-400 tracking-wide leading-none">الطلب</th>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 tracking-wide text-center leading-none">العميل</th>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 tracking-wide leading-none">الحالة التشغيلية</th>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 tracking-wide leading-none">الزمن</th>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 tracking-wide text-left leading-none">معاينة</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {loadingAll ? (
                        Array(6).fill(0).map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={5} className="h-16 bg-slate-50/20" /></tr>)
                     ) : filtered.length === 0 ? (
                        <tr><td colSpan={5} className="py-24 text-center"><FiInbox size={48} className="mx-auto text-slate-200 mb-4" /><p className="text-xs font-black text-slate-300 tracking-wide">لا توجد طلبات حالياً</p></td></tr>
                     ) : (
                        filtered.map((r: any) => (
                           <tr key={r.id} className={`group cursor-pointer transition-all ${selected?.id === r.id ? 'bg-primary/5' : 'hover:bg-slate-50/50'}`} onClick={() => setSelected(r)}>
                              <td className="px-8 py-5">
                                 <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all ${selected?.id === r.id ? 'bg-primary text-white' : 'bg-slate-50 text-slate-300 group-hover:bg-slate-900 group-hover:text-white'}`}>
                                       <FiPackage size={18} />
                                    </div>
                                    <div>
                                       <p className="text-sm font-black text-slate-900 leading-none mb-1.5 truncate max-w-[200px]">{r.title}</p>
                                       <p className="text-xs font-black text-slate-300 font-mono tracking-wide leading-none">ID_{r.id}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-5 text-center">
                                 <p className="text-xs font-black text-slate-900">{r.client?.fullName}</p>
                              </td>
                              <td className="px-8 py-5"><EliteStatusBadge status={r.status} /></td>
                              <td className="px-8 py-5 text-xs font-bold text-slate-400 font-mono italic">{formatDate(r.createdAt)}</td>
                              <td className="px-8 py-5 text-left text-slate-200 group-hover:text-primary transition-colors">
                                 <FiChevronLeft size={18} />
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Elite Inspection Panel */}
         <AnimatePresence>
            {selected && (
               <motion.aside
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 30, opacity: 0 }}
                  className="w-full xl:w-[450px] bg-slate-900 rounded-2xl p-10 sticky top-24 shadow-2xl text-white space-y-10"
               >
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-primary"><FiEye size={24} /></div>
                        <div>
                           <h2 className="text-base font-black tracking-tight">بروتوكول الطلب</h2>
                           <p className="text-xs font-bold text-slate-500 tracking-wide mt-1">بروتوكول المعالجة</p>
                        </div>
                     </div>
                     <button onClick={() => setSelected(null)} className="p-2 hover:bg-white/10 rounded-xl text-slate-500 transition-all"><FiX size={20} /></button>
                  </div>

                  <div className="space-y-8">
                     <div className="p-8 bg-white/5 border border-white/5 rounded-xl relative overflow-hidden">
                        <p className="text-xs text-slate-500 font-black tracking-wide mb-3">عنوان الطلب الحالي</p>
                        <h3 className="text-xl font-black leading-relaxed text-white mb-4 line-clamp-2">{selected.title}</h3>
                        <EliteStatusBadge status={selected.status} dark />
                     </div>

                     <div className="space-y-4">
                        <AuditRow icon={<FiUser />} label="مرسل الطلب" val={selected.client?.fullName || 'N/A'} />
                        <AuditRow icon={<FiMapPin />} label="نقطة الاستلام" val={selected.address || 'غير محدد'} />
                        <AuditRow icon={<FiClock />} label="تاريخ الإنشاء" val={formatDate(selected.createdAt)} />
                     </div>
                  </div>

                  {actionMsg && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`p-4 rounded-2xl text-xs font-black border tracking-wider text-center ${actionMsg.ok ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                       {actionMsg.text}
                    </motion.div>
                  )}

                  <div className="pt-8 border-t border-white/5 space-y-4">
                     {selected.status === "PENDING_ADMIN_REVISION" && (
                        <div className="grid grid-cols-1 gap-4">
                           <button 
                             onClick={() => doAction(selected.id, "approve")}
                             disabled={!!actionLoading}
                             className="w-full h-14 bg-primary text-white rounded-2xl text-sm font-black tracking-wide shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-3"
                           >
                              {actionLoading === "approve" ? <FiLoader size={18} className="animate-spin" /> : <FiCheckCircle size={18} />}
                              موافقة ونشر الطلب
                           </button>
                           <button 
                             onClick={() => doAction(selected.id, "reject")}
                             disabled={!!actionLoading}
                             className="w-full h-14 bg-white/5 border border-white/10 text-rose-400 rounded-2xl text-sm font-black tracking-wide hover:bg-rose-500/10 transition-all flex items-center justify-center gap-3"
                           >
                              {actionLoading === "reject" ? <FiLoader size={18} className="animate-spin" /> : <FiXCircle size={18} />}
                              رفض الطلب فوراً
                           </button>
                        </div>
                     )}
                     <Link href={`/admin/requests/${selected.id}`} className="w-full h-14 bg-white/5 border border-white/5 text-slate-400 rounded-2xl text-sm font-black tracking-wide hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                        عرض الملف التفصيلي <FiEye size={18} />
                     </Link>
                  </div>
               </motion.aside>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
}

function EliteMetric({ label, val, icon: Icon, accent }: any) {
  return (
    <div className="bg-white border border-slate-100 p-8 rounded-xl space-y-5 hover:border-primary/20 transition-all duration-500 group shadow-sm">
       <div className={`w-14 h-14 ${accent ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-slate-50 text-slate-300 group-hover:bg-slate-900 group-hover:text-white'} rounded-2xl flex items-center justify-center transition-all duration-500`}>
          <Icon size={24} />
       </div>
       <div>
          <p className="text-xs font-black text-slate-300 tracking-wide mb-1.5">{label}</p>
          <p className="text-2xl font-black text-slate-900 font-mono tracking-tighter">{val}</p>
       </div>
    </div>
  );
}

function EliteStatusBadge({ status, dark }: { status: RequestStatus; dark?: boolean }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: "text-slate-400", bg: "bg-slate-500/10" };
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black border tracking-wide ${dark ? 'bg-white/10 text-white border-white/5' : `${cfg.bg} ${cfg.color} border-current/10`}`}>
      <span className={`w-1 h-1 rounded-full ${cfg.color.replace('text-', 'bg-')}`} />
      {cfg.label}
    </span>
  );
}

function AuditRow({ icon, label, val }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
       <div className="flex items-center gap-3">
          <span className="text-slate-500">{icon}</span>
          <span className="text-xs font-black text-slate-500 tracking-wide">{label}</span>
       </div>
       <span className="text-xs font-bold text-slate-200 font-mono">{val}</span>
    </div>
  );
}

