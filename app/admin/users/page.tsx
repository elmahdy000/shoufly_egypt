"use client";

import { useCallback, useMemo, useState } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  Search, RefreshCw, Users, ShieldCheck,
  TrendingUp, Mail, Phone, Clock,
  Ban, X, ExternalLink,
  ShieldAlert, ChevronLeft, UserCircle2,
  Filter, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/shoofly/button";

type UserFilter = "ALL" | "ACTIVE" | "BLOCKED" | "VERIFIED";
type UserAction = "block" | "unblock" | "verify" | "unverify";

interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  isVerified: boolean;
  walletBalance: string | number;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserFilter>("ALL");
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [actionLoading, setActionLoading] = useState<UserAction | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: users, loading, setData, refresh } = useAsyncData<AdminUser[]>(
    async () => apiFetch<AdminUser[]>("/api/admin/users?limit=100", "ADMIN"), []
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 500);
  }, [refresh]);

  const stats = useMemo(() => {
    const all = users ?? [];
    return {
      total: all.length,
      active: all.filter((u) => u.isActive).length,
      verified: all.filter((u) => u.isVerified).length,
      blocked: all.filter((u) => !u.isActive).length,
    };
  }, [users]);

  const filtered = useMemo(() => {
    let list = users ?? [];
    if (statusFilter === "ACTIVE") list = list.filter((u) => u.isActive);
    if (statusFilter === "BLOCKED") list = list.filter((u) => !u.isActive);
    if (statusFilter === "VERIFIED") list = list.filter((u) => u.isVerified);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone ?? "").includes(q)
      );
    }
    return list;
  }, [users, statusFilter, search]);

  async function doAction(userId: number, action: UserAction) {
    setActionLoading(action);
    try {
      await apiFetch(`/api/admin/users/${userId}/moderation`, "ADMIN", { method: "PATCH", body: { action } });
      const patch: Partial<AdminUser> = {};
      if (action === "block") patch.isActive = false;
      if (action === "unblock") patch.isActive = true;
      if (action === "verify") patch.isVerified = true;
      if (action === "unverify") patch.isVerified = false;
      setData((prev) => (prev ?? []).map((u) => (u.id === userId ? { ...u, ...patch } : u)));
      setSelected((prev) => (prev?.id === userId ? { ...prev, ...patch } : prev));
    } catch (e) {} finally { setActionLoading(null); }
  }

  return (
    <div className="admin-page admin-page--spacious" dir="rtl">
      
      {/* 🚀 Header: Modern & Clean */}
      <section className="bg-white border-b border-slate-200 sticky top-0 z-40 overflow-hidden">
        <div className="px-6 lg:px-10 py-8 relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-1">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">نظام إدارة العضويات المركزي</span>
             </div>
             <h1 className="text-2xl font-bold tracking-tight text-slate-900 border-r-4 border-indigo-500 pr-4">إدارة <span className="text-indigo-600">المستخدمين</span></h1>
             <p className="text-sm text-slate-500 font-medium max-w-xl">تحكم كامل في صلاحيات الحسابات، توثيق الأعضاء، وتابع حركتهم المالية.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
             <div className="relative group w-full max-w-[350px]">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-all" size={18} />
                <input
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   placeholder="بتدور على عميل أو بريد؟ اكتب هنا..."
                   className="w-full pr-12 pl-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                />
             </div>
             <button onClick={handleRefresh} className="p-3 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
             </button>
          </div>
        </div>
      </section>

      <div className="px-6 lg:px-10 py-8 space-y-8">
        
        {/* 📊 KPI Strip */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <UStat label="إحصاء العضويات" val={stats.total} icon={Users} color="text-slate-600 bg-slate-100" />
          <UStat label="حسابات نشطة" val={stats.active} icon={CheckCircle2} color="text-emerald-600 bg-emerald-50" />
          <UStat label="أعضاء موثقين" val={stats.verified} icon={ShieldCheck} color="text-indigo-600 bg-indigo-50" />
          <UStat label="الموقفين إدارياً" val={stats.blocked} icon={Ban} color="text-rose-600 bg-rose-50" />
        </section>

        {/* 🛠 Filter Controls */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
           <div className="flex flex-wrap items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center ml-2 border border-slate-100">
                 <Filter size={16} />
              </div>
              {([{ id: "ALL", label: "كل المستخدمين" }, { id: "ACTIVE", label: "نشط حالياً" }, { id: "VERIFIED", label: "موثقين فقط" }, { id: "BLOCKED", label: "موقوفين" }] as { id: UserFilter; label: string }[]).map((tab) => (
                <button 
                  key={tab.id} 
                  onClick={() => setStatusFilter(tab.id)} 
                  className={`px-6 py-2 rounded-lg text-xs font-bold border transition-all ${statusFilter === tab.id ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"}`}
                >
                  {tab.label}
                </button>
              ))}
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           
           {/* 📋 User Grid */}
           <div className="lg:col-span-8">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {[1,2,3,4].map(i => <div key={i} className="h-64 bg-white border border-slate-200 rounded-2xl animate-pulse" />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="h-80 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-4">
                   <UserCircle2 size={48} className="opacity-20" />
                   <p className="text-base font-bold">مفيش مستخدمين بالتصنيف ده دلوقتي</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <AnimatePresence mode="popLayout">
                     {filtered.map(u => (
                       <motion.div
                         layout
                         key={u.id}
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, scale: 0.95 }}
                         onClick={() => setSelected(u)}
                         className={`p-6 rounded-2xl bg-white border transition-all cursor-pointer group flex flex-col justify-between shadow-sm min-h-[260px] ${selected?.id === u.id ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-200 hover:border-indigo-400 hover:shadow-md'}`}
                       >
                         <div>
                            <div className="flex items-start justify-between mb-6">
                               <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl transition-all ${selected?.id === u.id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                                  {u.fullName?.charAt(0) || "U"}
                               </div>
                               <div className="flex flex-col items-end gap-2">
                                  {u.isVerified && (
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[9px] font-bold border border-emerald-200 uppercase tracking-tighter">Verified <ShieldCheck size={12} /></span>
                                  )}
                                  {!u.isActive && (
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-700 rounded-lg text-[9px] font-bold border border-rose-200 uppercase tracking-tighter">Blocked <Ban size={12} /></span>
                                  )}
                               </div>
                            </div>
                            
                            <div className="space-y-1">
                               <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{u.fullName || "مستخدم غير مسمى"}</h3>
                               <p className="text-xs text-slate-400 font-medium truncate">{u.email || "بدون بريد"}</p>
                            </div>
                         </div>

                         <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex flex-col">
                               <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">الرصيد</span>
                               <span className="text-xl font-bold text-slate-900 font-jakarta">{formatCurrency(u.walletBalance)}</span>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 transition-all group-hover:bg-indigo-600 group-hover:text-white">
                               <ChevronLeft size={18} />
                            </div>
                         </div>
                       </motion.div>
                     ))}
                   </AnimatePresence>
                </div>
              )}
           </div>

           {/* 🛡️ User Inspector */}
           <AnimatePresence>
              {selected ? (
                 <motion.aside
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="lg:col-span-4 bg-white rounded-2xl p-4 lg:p-8 border border-slate-200 shadow-sm lg:sticky lg:top-28 space-y-8 overflow-hidden"
                 >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-6 text-slate-900">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                             <UserCircle2 size={24} />
                          </div>
                          <div>
                             <h2 className="text-lg font-bold">تدقيق الحساب</h2>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">AUTH_LOGS: ACTIVE</p>
                          </div>
                       </div>
                       <button onClick={() => setSelected(null)} className="p-2 bg-slate-100 hover:bg-rose-100 rounded-lg text-slate-400 hover:text-rose-600 transition-all active:scale-95"><X size={18} /></button>
                    </div>

                    <div className="space-y-6">
                       <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">معلومات العضوية</p>
                          <h3 className="text-2xl font-bold leading-tight text-slate-900">{selected.fullName}</h3>
                          
                          <div className="flex flex-wrap gap-2 pt-2">
                             <div className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${selected.isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
                                {selected.isActive ? 'حساب مفعّل' : 'موقوف إدارياً'}
                             </div>
                             {selected.isVerified && (
                                <div className="px-3 py-1 rounded-lg text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">موثّق رسمياً</div>
                             )}
                          </div>
                       </div>

                       <div className="space-y-2">
                          <UInfoLine icon={<Phone size={16} />} label="رقم الجوال" value={selected.phone || 'غير مدرج'} />
                          <UInfoLine icon={<Mail size={16} />} label="البريد الإلكتروني" value={selected.email} />
                          <UInfoLine icon={<TrendingUp size={16} />} label="إجمالي المحفظة" value={formatCurrency(selected.walletBalance)} />
                          <UInfoLine icon={<Clock size={16} />} label="تاريخ التسجيل" value={formatDate(selected.createdAt)} />
                       </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 space-y-3">
                       <button 
                         onClick={() => doAction(selected.id, selected.isVerified ? "unverify" : "verify")}
                         className={`w-full h-14 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] border shadow-sm ${selected.isVerified ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700'}`}
                       >
                          {selected.isVerified ? <ShieldAlert size={20} className="text-rose-500" /> : <ShieldCheck size={20} />}
                          {selected.isVerified ? "إلغاء توثيق الحساب" : "وثّق الحساب"}
                       </button>
                       
                       <button 
                         onClick={() => doAction(selected.id, selected.isActive ? "block" : "unblock")}
                         className={`w-full h-12 rounded-xl font-bold text-xs border transition-all active:scale-[0.98] ${!selected.isActive ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700' : 'bg-white border-rose-200 text-rose-600 hover:bg-rose-50'}`}
                       >
                          {!selected.isActive ? <CheckCircle2 size={18} /> : <Ban size={18} />}
                          {!selected.isActive ? "شغّل الحساب تاني" : "وقّف الحساب فوراً"}
                       </button>

                       <button className="w-full h-11 text-slate-400 hover:text-slate-600 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                          <ExternalLink size={14} /> فتح سجل النشاط
                       </button>
                    </div>
                 </motion.aside>
              ) : (
                <div className="lg:col-span-4 h-[400px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-4">
                   <UserCircle2 size={48} className="opacity-20" />
                   <p className="text-sm font-medium">اختار مستخدم عشان تشوف تفاصيل حسابه</p>
                </div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function UStat({ label, val, icon: Icon, color }: { label: string; val: number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-5 shadow-sm hover:shadow-md transition-all">
       <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-sm border border-black/5`}>
          <Icon size={22} />
       </div>
       <div className="space-y-0.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</p>
          <p className="text-2xl font-bold text-slate-900 leading-none mt-1">{val}</p>
       </div>
    </div>
  );
}

function UInfoLine({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
       <div className="flex items-center gap-3">
          <span className="text-slate-400">{icon}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{label}</span>
       </div>
       <span className={`text-sm font-bold ${highlight ? 'text-amber-600' : 'text-slate-900'} font-jakarta`}>{value}</span>
    </div>
  );
}
