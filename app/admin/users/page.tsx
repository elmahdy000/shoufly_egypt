"use client";

import { useState, useMemo, useCallback } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  FiSearch, FiX, FiLoader, FiUser, FiShield, FiSlash, 
  FiChevronLeft, FiRefreshCw, FiMail, FiPhone, FiCalendar,
  FiUsers, FiBriefcase, FiTruck, FiActivity, FiKey
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  ADMIN:    { label: "مدير تقني",   color: "text-orange-600", bg: "bg-orange-50", icon: FiShield },
  CLIENT:   { label: "عميل نشط",   color: "text-amber-600",    bg: "bg-amber-50",    icon: FiUser },
  VENDOR:   { label: "شريك مورد",   color: "text-amber-600",  bg: "bg-amber-50",  icon: FiBriefcase },
  DELIVERY: { label: "كابتن شحن",   color: "text-emerald-600",bg: "bg-emerald-50",icon: FiTruck },
};

export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState<"ALL" | "CLIENT" | "VENDOR" | "DELIVERY" | "ADMIN">("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: users, loading, setData, refresh } = useAsyncData<any[]>(
    () => apiFetch("/api/admin/users", "ADMIN"), []
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 500);
  }, [refresh]);

  const filtered = useMemo(() => {
    let list = users ?? [];
    if (roleFilter !== "ALL") list = list.filter((u: any) => u.role === roleFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((u: any) =>
        u.fullName?.toLowerCase().includes(q) || 
        u.email?.toLowerCase().includes(q) || 
        u.phone?.includes(q)
      );
    }
    return list;
  }, [users, roleFilter, search]);

  const stats = useMemo(() => {
    const all = users ?? [];
    return {
      total: all.length,
      vendors: all.filter((u: any) => u.role === "VENDOR").length,
      clients: all.filter((u: any) => u.role === "CLIENT").length,
      delivery: all.filter((u: any) => u.role === "DELIVERY").length,
    };
  }, [users]);

  async function doAction(userId: number, action: string) {
    setActionLoading(action);
    setActionMsg(null);
    try {
      await apiFetch<any>(`/api/admin/users/${userId}/moderation`, "ADMIN", {
        method: "PATCH", body: { action },
      });
      const patch: any = { isActive: action === "UNBLOCK" };
      setData((prev: any[] | null) => (prev ?? []).map((u) => u.id === userId ? { ...u, ...patch } : u));
      setSelected((prev: any) => prev?.id === userId ? { ...prev, ...patch } : prev);
      setActionMsg({ text: "تم تحديث حالة المستخدم بنجاح ✓", ok: true });
    } catch (e: any) {
      setActionMsg({ text: e.message || "فشلت العملية", ok: false });
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="admin-page admin-page--spacious" dir="rtl">
      
      {/* Architectural Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-slate-100 pb-10">
        <div>
           <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-xs font-black text-slate-400 tracking-wide">إدارة هويات المستخدمين</span>
           </div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">إدارة <span className="text-slate-300 font-light">/</span> كافة المستخدمين</h1>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative group">
              <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث بالاسم، البريد أو الهاتف..."
                className="w-full sm:w-80 pr-11 pl-4 h-11 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:bg-white focus:border-primary outline-none transition-all"
              />
           </div>
           <button onClick={handleRefresh} className="h-11 px-6 bg-white border border-slate-200 rounded-xl text-xs font-black tracking-wide text-slate-900 shadow-sm hover:border-primary transition-all flex items-center gap-2">
              <FiRefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
              تزامن البيانات
           </button>
        </div>
      </div>

      {/* 📊 Metrics Infrastructure */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <EliteMetric label="إجمالي الحسابات" val={stats.total} icon={FiUsers} />
         <EliteMetric label="العملاء النشطون" val={stats.clients} icon={FiUser} />
         <EliteMetric label="الموردون" val={stats.vendors} icon={FiBriefcase} />
         <EliteMetric label="أساطيل الشحن" val={stats.delivery} icon={FiTruck} />
      </div>

      <div className="flex flex-col xl:flex-row gap-10 items-start">
         <div className="flex-1 w-full space-y-8">
            {/* Context Switcher */}
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100 w-fit">
               {[
                 { id: 'ALL', label: 'كافة الأدوار' },
                 { id: 'CLIENT', label: 'العملاء' },
                 { id: 'VENDOR', label: 'الموردون' },
                 { id: 'DELIVERY', label: 'المناديب' },
                 { id: 'ADMIN', label: 'المدراء' }
               ].map(t => (
                 <button
                   key={t.id}
                   onClick={() => setRoleFilter(t.id as any)}
                   className={`px-6 py-2 rounded-lg text-sm font-black transition-all ${
                     roleFilter === t.id ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'
                   }`}
                 >
                   {t.label}
                 </button>
               ))}
            </div>

            {/* Precision Data Table */}
            <div className="bg-white border border-slate-100 rounded-xl shadow-xl shadow-slate-200/20 overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-right">
                     <thead>
                        <tr className="border-b border-slate-50 bg-slate-50/50">
                           <th className="px-8 py-5 text-xs font-black text-slate-400 tracking-wide leading-none">المستخدم</th>
                           <th className="px-8 py-5 text-xs font-black text-slate-400 tracking-wide text-center leading-none">الدور</th>
                           <th className="px-8 py-5 text-xs font-black text-slate-400 tracking-wide leading-none">المحفظة</th>
                           <th className="px-8 py-5 text-xs font-black text-slate-400 tracking-wide leading-none">الحالة</th>
                           <th className="px-8 py-5 text-xs font-black text-slate-400 tracking-wide text-left leading-none">تفتيش</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {loading ? (
                           Array(6).fill(0).map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={5} className="h-16 bg-slate-50/20" /></tr>)
                        ) : filtered.length === 0 ? (
                           <tr><td colSpan={5} className="py-20 text-center"><p className="text-slate-300 font-black italic tracking-wide text-xs">لا توجد نتائج</p></td></tr>
                        ) : (
                           filtered.map((u: any) => (
                              <tr key={u.id} className={`group cursor-pointer transition-all ${selected?.id === u.id ? 'bg-primary/5' : 'hover:bg-slate-50/50'}`} onClick={() => setSelected(u)}>
                                 <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all ${selected?.id === u.id ? 'bg-primary text-white' : 'bg-slate-50 text-slate-300 group-hover:bg-slate-900 group-hover:text-white'}`}>
                                          {u.fullName?.charAt(0)}
                                       </div>
                                       <div>
                                          <p className="text-sm font-black text-slate-900 leading-none mb-1.5">{u.fullName}</p>
                                          <p className="text-xs font-bold text-slate-400 italic font-mono">{u.email}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-8 py-5 text-center">
                                    <EliteRoleBadge role={u.role} />
                                 </td>
                                 <td className="px-8 py-5"><span className="text-sm font-black text-slate-900 font-mono tracking-tighter">{formatCurrency(u.walletBalance)}</span></td>
                                 <td className="px-8 py-5">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border tracking-wide ${u.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                       {u.isActive ? 'نشط' : 'موقوف'}
                                    </span>
                                 </td>
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
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-primary"><FiKey size={24} /></div>
                        <div>
                           <h2 className="text-base font-black tracking-tight">ملف الهوية</h2>
                           <p className="text-xs font-bold text-slate-500 tracking-wide mt-1">بيانات الهوية</p>
                        </div>
                     </div>
                     <button onClick={() => setSelected(null)} className="p-2 hover:bg-white/10 rounded-xl text-slate-500 transition-all"><FiX size={20} /></button>
                  </div>

                  <div className="flex flex-col items-center gap-6 py-10 bg-white/5 rounded-xl border border-white/5 relative overflow-hidden">
                     <div className="w-24 h-24 bg-primary rounded-xl flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-primary/40 relative z-10">
                        {selected.fullName?.charAt(0)}
                     </div>
                     <div className="text-center relative z-10">
                        <h3 className="text-2xl font-black tracking-tight">{selected.fullName}</h3>
                        <div className="mt-3 flex justify-center"><EliteRoleBadge role={selected.role} dark /></div>
                     </div>
                     <div className="absolute top-0 left-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full" />
                  </div>

                  <div className="space-y-3">
                     <AuditDetail icon={<FiMail size={14} />} label="البريد المعتمد" val={selected.email} />
                     <AuditDetail icon={<FiPhone size={14} />} label="قناة التواصل" val={selected.phone || '—'} />
                     <AuditDetail icon={<FiCalendar size={14} />} label="تاريخ الانضمام" val={formatDate(selected.createdAt)} />
                  </div>

                  {actionMsg && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`p-4 rounded-2xl text-xs font-black border tracking-wider text-center ${actionMsg.ok ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                       {actionMsg.text}
                    </motion.div>
                  )}

                  <div className="pt-8 border-t border-white/5 space-y-4">
                     <button 
                        disabled={!!actionLoading}
                        onClick={() => doAction(selected.id, selected.isActive ? "BLOCK" : "UNBLOCK")}
                        className={`w-full h-14 rounded-2xl text-sm font-black tracking-wide transition-all flex items-center justify-center gap-3 ${
                           selected.isActive 
                           ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20' 
                           : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                        }`}
                     >
                        {actionLoading ? <FiLoader size={16} className="animate-spin" /> : (selected.isActive ? <FiSlash size={16} /> : <FiActivity size={16} />)}
                        {selected.isActive ? "إيقاف الحساب" : "إعادة تفعيل الحساب"}
                     </button>
                     <button className="w-full h-14 bg-white text-slate-900 rounded-2xl text-sm font-black tracking-wide hover:bg-slate-200 transition-all shadow-lg">
                        مراجعة سجلات الحركات
                     </button>
                  </div>
               </motion.aside>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
}

function EliteMetric({ label, val, icon: Icon }: any) {
  return (
    <div className="bg-white border border-slate-100 p-8 rounded-xl space-y-5 hover:border-primary/20 transition-all duration-500 group shadow-sm">
       <div className="w-14 h-14 bg-slate-50 text-slate-300 group-hover:bg-slate-900 group-hover:text-white rounded-2xl flex items-center justify-center transition-all duration-500">
          <Icon size={24} />
       </div>
       <div>
          <p className="text-xs font-black text-slate-400 tracking-wide mb-1.5">{label}</p>
          <p className="text-2xl font-black text-slate-900 font-mono tracking-tighter">{val}</p>
       </div>
    </div>
  );
}

function EliteRoleBadge({ role, dark }: { role: string; dark?: boolean }) {
  const cfg = ROLE_CONFIG[role] || { label: role, color: "text-slate-500", bg: "bg-slate-50", icon: FiUser };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black border tracking-wide ${dark ? 'bg-white/10 text-white border-white/10' : `${cfg.bg} ${cfg.color} border-current/10`}`}>
      <Icon size={12} strokeWidth={3} />
      {cfg.label}
    </span>
  );
}

function AuditDetail({ icon, label, val }: any) {
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

