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
    <div className="min-h-full bg-[#F1F5F9] pb-32 font-sans text-right" dir="rtl">
      
      {/* 🚀 Header: Ultra-Contrast Bold */}
      <section className="bg-slate-950 text-white border-b-8 border-indigo-600 sticky top-0 z-40 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -mr-40 -mt-40 opacity-50" />
        <div className="w-full px-8 lg:px-12 py-10 relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
                <span className="text-[11px] font-black tracking-[0.4em] text-indigo-400 uppercase">نظام إدارة العضويات المركزي</span>
             </div>
             <h1 className="text-4xl lg:text-5xl font-black tracking-tighter">إدارة <span className="text-indigo-400 italic">المستخدمين</span></h1>
             <p className="text-lg text-slate-400 font-bold max-w-2xl leading-relaxed">تحكّم كامل في صلاحيات الحسابات، مراجعة التوثيق، ومتابعة النشاط المالي للأعضاء.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
             <div className="relative group w-full sm:w-[400px]">
                <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-all" size={24} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="بحث باسم العميل أو بريده..."
                  className="w-full pr-16 pl-6 h-16 bg-white/10 border-4 border-white/10 rounded-2xl text-xl font-bold text-white focus:bg-white focus:text-slate-950 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-600"
                />
             </div>
             <Button onClick={handleRefresh} className="h-16 px-8 rounded-2xl bg-indigo-600 text-white font-black border-4 border-slate-950 shadow-[8px_8px_0px_#ffffff10] hover:scale-[1.02] active:scale-95 transition-all">
                <RefreshCw size={24} className={isRefreshing ? "animate-spin" : ""} />
             </Button>
          </div>
        </div>
      </section>

      <div className="w-full px-8 lg:px-12 py-12 space-y-12">
        
        {/* 📊 KPI Strip: Bold & Closer */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <UStat label="إحصاء العضويات" val={stats.total} icon={Users} color="bg-slate-900" delay={0.1} />
          <UStat label="حسابات نشطة" val={stats.active} icon={CheckCircle2} color="bg-emerald-600" pulse delay={0.2} />
          <UStat label="أعضاء موثقين" val={stats.verified} icon={ShieldCheck} color="bg-indigo-600" delay={0.3} />
          <UStat label="الموقفين إدارياً" val={stats.blocked} icon={Ban} color="bg-rose-600" delay={0.4} />
        </section>

        {/* 🛠 Heavy Filter Controls */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border-4 border-slate-950 p-10 rounded-[3rem] shadow-[25px_25px_0px_rgba(15,23,42,0.04)]"
        >
           <div className="flex flex-wrap items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-950 text-white flex items-center justify-center ml-4">
                 <Filter size={24} />
              </div>
              {([{ id: "ALL", label: "كل المستخدمين" }, { id: "ACTIVE", label: "نشط حالياً" }, { id: "VERIFIED", label: "موثقين فقط" }, { id: "BLOCKED", label: "موقوفين" }] as { id: UserFilter; label: string }[]).map((tab) => (
                <button 
                  key={tab.id} 
                  onClick={() => setStatusFilter(tab.id)} 
                  className={`px-10 py-4 rounded-2xl text-base font-black border-4 transition-all ${statusFilter === tab.id ? "bg-indigo-600 text-white border-slate-950 shadow-xl scale-105" : "bg-white text-slate-400 border-slate-100 hover:border-slate-950 hover:text-slate-950"}`}
                >
                  {tab.label}
                </button>
              ))}
           </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
           
           {/* 📋 User Grid: High Density / High Contrast */}
           <div className="lg:col-span-8">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {[1,2,3,4].map(i => <div key={i} className="h-80 bg-white border-4 border-slate-50 rounded-[3rem] animate-pulse" />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="h-96 bg-white border-4 border-slate-100 border-dashed rounded-[4rem] flex flex-col items-center justify-center text-slate-300">
                   <UserCircle2 size={120} className="mb-6 opacity-10" />
                   <p className="text-2xl font-black opacity-30 italic">لا يوجد مستخدمين بهذا التصنيف</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-bold">
                   <AnimatePresence mode="popLayout">
                     {filtered.map(u => (
                       <motion.div
                         layout
                         key={u.id}
                         initial={{ scale: 0.95, opacity: 0 }}
                         animate={{ scale: 1, opacity: 1 }}
                         exit={{ scale: 0.95, opacity: 0 }}
                         whileHover={{ y: -10, rotate: 1 }}
                         onClick={() => setSelected(u)}
                         className={`p-10 rounded-[3.5rem] bg-white border-4 transition-all cursor-pointer group relative ${selected?.id === u.id ? 'border-indigo-600 shadow-3xl' : 'border-white hover:border-slate-950 shadow-xl shadow-slate-200/50'}`}
                       >
                         <div className="flex items-start justify-between mb-10">
                            <div className={`w-24 h-24 rounded-[2rem] border-4 flex items-center justify-center font-black text-4xl transition-all duration-300 ${selected?.id === u.id ? 'bg-indigo-600 text-white border-slate-950 scale-110 rotate-3 shadow-2xl' : 'bg-slate-100 text-slate-400 border-slate-200 group-hover:bg-slate-950 group-hover:border-slate-950 group-hover:text-white group-hover:-rotate-3'}`}>
                               {u.fullName.charAt(0)}
                            </div>
                            <div className="flex flex-col items-end gap-3 pt-2">
                               {u.isVerified && (
                                 <span className="flex items-center gap-2 px-5 py-2 bg-emerald-500 text-white rounded-2xl text-[11px] font-black border-2 border-slate-950 uppercase tracking-widest shadow-lg">Verified <ShieldCheck size={16} /></span>
                               )}
                               {!u.isActive && (
                                 <span className="flex items-center gap-2 px-5 py-2 bg-rose-500 text-white rounded-2xl text-[11px] font-black border-2 border-slate-950 uppercase tracking-widest shadow-lg">Blocked <Ban size={16} /></span>
                               )}
                            </div>
                         </div>
                         
                         <div className="space-y-3">
                            <h3 className="text-2xl lg:text-3xl font-black text-slate-950 group-hover:text-indigo-600 transition-all">{u.fullName}</h3>
                            <p className="text-base text-slate-500 font-jakarta">{u.email}</p>
                         </div>

                         <div className="mt-12 pt-8 border-t-4 border-slate-50 flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">الرصيد المتاح</span>
                               <span className="text-3xl font-black text-slate-950 tracking-tighter font-jakarta italic">{formatCurrency(u.walletBalance)}</span>
                            </div>
                            <div className="w-16 h-16 rounded-[1.5rem] bg-slate-950 flex items-center justify-center text-white shadow-2xl transition-all group-hover:bg-indigo-600 group-hover:scale-110">
                               <ChevronLeft size={36} />
                            </div>
                         </div>
                       </motion.div>
                     ))}
                   </AnimatePresence>
                </div>
              )}
           </div>

           {/* 🛡️ User Inspector: Side Audit Panel */}
           <AnimatePresence>
              {selected && (
                 <motion.aside
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 50, opacity: 0 }}
                    className="lg:col-span-4 bg-slate-950 rounded-[4rem] p-12 shadow-[0_40px_100px_rgba(0,0,0,0.6)] text-white sticky top-40 space-y-12 border-l-8 border-indigo-500 overflow-hidden"
                 >
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[120px] -mr-40 -mt-40" />
                    
                    <div className="flex items-center justify-between relative z-10">
                       <div className="flex items-center gap-6">
                          <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl border-2 border-white/20">
                             <UserCircle2 size={50} />
                          </div>
                          <div>
                             <h2 className="text-2xl font-black tracking-tight">تدقيق الحساب</h2>
                             <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] mt-2">USER_AUTH_LOGS: ACTIVE</p>
                          </div>
                       </div>
                       <button onClick={() => setSelected(null)} className="p-5 bg-white/5 hover:bg-white/20 rounded-3xl text-white transition-all active:scale-95 shadow-lg border-2 border-white/5">
                          <X size={32} />
                       </button>
                    </div>

                    <div className="space-y-10 relative z-10">
                       <div className="p-10 bg-white/5 border-2 border-white/10 rounded-[3.5rem] space-y-10">
                          <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em]">معلومات العضوية</p>
                          <h3 className="text-4xl font-black leading-tight text-white mb-6 underline decoration-indigo-500/50 underline-offset-8">{selected.fullName}</h3>
                          
                          <div className="flex flex-wrap gap-4 pt-4">
                             <div className={`px-8 py-3 rounded-2xl text-[11px] font-black border-4 ${selected.isActive ? 'bg-emerald-500 text-white border-slate-950 shadow-xl' : 'bg-rose-500 text-white border-slate-950 shadow-xl'}`}>
                                {selected.isActive ? 'حساب مفعّل' : 'موقوف إدارياً'}
                             </div>
                             {selected.isVerified && (
                                <div className="px-8 py-3 rounded-2xl text-[11px] font-black bg-indigo-600 text-white border-4 border-slate-950 shadow-xl">موثّق رسمياً</div>
                             )}
                          </div>
                       </div>

                       <div className="space-y-5">
                          <UInfoLine icon={<Phone size={24} />} label="رقم الجوال" value={selected.phone || 'غير مدرج'} />
                          <UInfoLine icon={<Mail size={24} />} label="البريد الإلكتروني" value={selected.email} />
                          <UInfoLine icon={<TrendingUp size={24} />} label="إجمالي المحفظة" value={formatCurrency(selected.walletBalance)} />
                          <UInfoLine icon={<Clock size={24} />} label="تاريخ التسجيل" value={formatDate(selected.createdAt)} />
                       </div>
                    </div>

                    <div className="pt-12 border-t-8 border-white/5 space-y-6 relative z-10">
                       <div className="grid grid-cols-1 gap-6">
                          <Button 
                            onClick={() => doAction(selected.id, selected.isVerified ? "unverify" : "verify")}
                            className={`h-24 rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-6 transition-all active:scale-95 border-4 border-slate-950 ${selected.isVerified ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-indigo-600 text-white shadow-3xl shadow-indigo-600/30 hover:scale-[1.02]'}`}
                          >
                             {selected.isVerified ? <ShieldAlert size={36} className="text-rose-400" /> : <ShieldCheck size={36} />}
                             {selected.isVerified ? "إلغاء توثيق الهوية" : "تفعيل التوثيق الرسمي"}
                          </Button>
                          
                          <Button 
                            onClick={() => doAction(selected.id, selected.isActive ? "block" : "unblock")}
                            className={`h-20 rounded-[2rem] font-black text-base border-4 transition-all active:scale-95 ${!selected.isActive ? 'bg-emerald-500 border-slate-950 text-white shadow-2xl' : 'bg-white/5 border-white/20 text-rose-500 hover:bg-rose-600 hover:text-white hover:border-slate-950 shadow-xl'}`}
                          >
                             {!selected.isActive ? <CheckCircle2 size={32} /> : <Ban size={32} />}
                             {!selected.isActive ? "استعادة نشاط الجهاز" : "تعليق وصول الحساب"}
                          </Button>
                       </div>
                       
                       <Button className="w-full h-16 bg-white/5 border-none text-white/30 hover:text-white transition-colors hover:bg-white/10 flex items-center justify-center gap-4 text-xs font-black uppercase tracking-widest">
                          <ExternalLink size={20} />
                          فتح سجل النشاط بالكامل
                       </Button>
                    </div>
                 </motion.aside>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function UStat({ label, val, icon: Icon, color, isCurrency, pulse, delay }: { label: string; val: number; icon: React.ElementType; color: string; isCurrency?: boolean; pulse?: boolean; delay: number }) {
  return (
    <motion.div 
      initial={{ y: 30, opacity: 0 }} 
      animate={{ y: 0, opacity: 1 }} 
      transition={{ delay }}
      className="bg-white border-4 border-slate-950 p-10 rounded-[3rem] space-y-8 hover:shadow-[20px_20px_0px_#0f172a] hover:translate-x-[-10px] hover:translate-y-[-10px] transition-all duration-500 group relative overflow-hidden shadow-2xl"
    >
       <div className={`w-24 h-24 ${color} text-white rounded-[2rem] flex items-center justify-center shadow-xl border-4 border-slate-950 relative transition-transform duration-500 group-hover:rotate-12`}>
          <Icon size={40} />
          {pulse && <span className="absolute -top-3 -right-3 w-8 h-8 bg-white border-4 border-emerald-400 rounded-full flex items-center justify-center shadow-sm"><span className="w-3.5 h-3.5 bg-emerald-400 rounded-full animate-ping" /></span>}
       </div>
       <div className="space-y-2">
          <p className="text-[12px] font-black text-slate-500 uppercase tracking-[0.3em] font-jakarta">{label}</p>
          <p className="text-5xl font-black text-slate-950 font-jakarta tracking-tighter leading-none">
             {isCurrency ? formatCurrency(val).split('.')[0] : val}
          </p>
       </div>
    </motion.div>
  );
}

function UInfoLine({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between p-6 bg-white/5 border-2 border-white/5 rounded-[2rem] group hover:border-white/20 transition-all shadow-md">
       <div className="flex items-center gap-5">
          <span className="text-white/30 group-hover:text-indigo-400 transition-colors">{icon}</span>
          <span className="text-[12px] font-black text-white/40 uppercase tracking-widest">{label}</span>
       </div>
       <span className={`text-base font-black ${highlight ? 'text-amber-400' : 'text-white/90'} group-hover:text-white transition-all font-jakarta`}>{value}</span>
    </div>
  );
}
