"use client";

import { useCallback, useMemo, useState } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  Search, RefreshCw, Store, ShieldCheck,
  TrendingUp, Mail, Phone, Clock,
  Ban, X, ExternalLink,
  ShieldAlert, ChevronLeft, Building2,
  CreditCard, Filter, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/shoofly/button";

type VendorFilter = "ALL" | "ACTIVE" | "BLOCKED" | "VERIFIED";
type VendorAction = "block" | "unblock" | "verify" | "unverify";

interface Vendor {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  isVerified: boolean;
  walletBalance: string | number;
  createdAt: string;
}

export default function AdminVendorsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VendorFilter>("ALL");
  const [selected, setSelected] = useState<Vendor | null>(null);
  const [actionLoading, setActionLoading] = useState<VendorAction | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: vendors, loading, setData, refresh } = useAsyncData<Vendor[]>(
    async () => apiFetch<Vendor[]>("/api/admin/vendors?limit=100", "ADMIN"), []
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 500);
  }, [refresh]);

  const stats = useMemo(() => {
    const all = vendors ?? [];
    const totalWallet = all.reduce((sum, v) => sum + Number(v.walletBalance), 0);
    return {
      total: all.length,
      active: all.filter((v) => v.isActive).length,
      verified: all.filter((v) => v.isVerified).length,
      totalWallet,
    };
  }, [vendors]);

  const filtered = useMemo(() => {
    let list = vendors ?? [];
    if (statusFilter === "ACTIVE") list = list.filter((v) => v.isActive);
    if (statusFilter === "BLOCKED") list = list.filter((v) => !v.isActive);
    if (statusFilter === "VERIFIED") list = list.filter((v) => v.isVerified);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((v) =>
        v.fullName.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q) ||
        (v.phone ?? "").includes(q)
      );
    }
    return list;
  }, [vendors, statusFilter, search]);

  async function doAction(vendorId: number, action: VendorAction) {
    setActionLoading(action);
    try {
      await apiFetch(`/api/admin/users/${vendorId}/moderation`, "ADMIN", { method: "PATCH", body: { action } });
      const patch: Partial<Vendor> = {};
      if (action === "block") patch.isActive = false;
      if (action === "unblock") patch.isActive = true;
      if (action === "verify") patch.isVerified = true;
      if (action === "unverify") patch.isVerified = false;
      setData((prev) => (prev ?? []).map((v) => (v.id === vendorId ? { ...v, ...patch } : v)));
      setSelected((prev) => (prev?.id === vendorId ? { ...prev, ...patch } : prev));
    } catch (e) {} finally { setActionLoading(null); }
  }

  return (
    <div className="min-h-full bg-[#F1F5F9] pb-32 font-sans text-right" dir="rtl">
      
      {/* 🚀 Header: Enterprise Bold & Close */}
      <section className="bg-slate-950 text-white border-b-8 border-primary sticky top-0 z-40 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -mr-40 -mt-40 opacity-50" />
        <div className="w-full px-8 lg:px-12 py-10 relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-primary animate-pulse shadow-[0_0_15px_rgba(var(--primary),0.8)]" />
                <span className="text-[11px] font-black tracking-[0.4em] text-primary uppercase">إدارة الكيانات والشركات المعتمدة</span>
             </div>
             <h1 className="text-4xl lg:text-5xl font-black tracking-tighter">بوابة <span className="text-primary italic">التجار</span></h1>
             <p className="text-lg text-slate-400 font-bold max-w-2xl leading-relaxed">تحكّم شامل في متاجر المنصة، متابعة أرصدة المحافظ، واعتماد الوثائق الرسمية للشركاء.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
             <div className="relative group w-full sm:w-[450px]">
                <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-all" size={24} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث باسم المتجر أو المالك..."
                  className="w-full pr-16 pl-6 h-16 bg-white/10 border-4 border-white/10 rounded-2xl text-xl font-bold text-white focus:bg-white focus:text-slate-950 focus:border-primary outline-none transition-all placeholder:text-slate-600"
                />
             </div>
             <Button onClick={handleRefresh} className="h-16 px-8 rounded-2xl bg-indigo-600 text-white font-black border-4 border-slate-950 shadow-[8px_8px_0px_#ffffff10] hover:scale-[1.02] active:scale-95 transition-all">
                <RefreshCw size={24} className={isRefreshing ? "animate-spin" : ""} />
             </Button>
          </div>
        </div>
      </section>

      <div className="w-full px-8 lg:px-12 py-12 space-y-12">
        
        {/* 📊 KPI Strip: Solid & Impactful */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <VStat label="إجمالي الشركاء" val={stats.total} icon={Store} color="bg-slate-900" delay={0.1} />
          <VStat label="متاجر معتمدة" val={stats.verified} icon={ShieldCheck} color="bg-indigo-600" pulse delay={0.2} />
          <VStat label="إجمالي المحافظ" val={stats.totalWallet} icon={CreditCard} color="bg-emerald-600" isCurrency delay={0.3} />
          <VStat label="تجار موقوفين" val={stats.total - stats.active} icon={Ban} color="bg-rose-600" delay={0.4} />
        </section>

        {/* 🛠 Heavy Filter Control Bridge */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border-4 border-slate-950 p-10 rounded-[3rem] shadow-[25px_25px_0px_rgba(15,23,42,0.04)]"
        >
           <div className="flex flex-wrap items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-950 text-white flex items-center justify-center ml-4">
                 <Filter size={24} />
              </div>
              {([{ id: "ALL", label: "كل المتاجر" }, { id: "ACTIVE", label: "نشط حالياً" }, { id: "VERIFIED", label: "موثقين فقط" }, { id: "BLOCKED", label: "موقوفين" }] as { id: VendorFilter; label: string }[]).map((tab) => (
                <button 
                  key={tab.id} 
                  onClick={() => setStatusFilter(tab.id)} 
                  className={`px-10 py-4 rounded-2xl text-base font-black border-4 transition-all ${statusFilter === tab.id ? "bg-primary text-slate-950 border-slate-950 shadow-xl scale-105" : "bg-white text-slate-400 border-slate-100 hover:border-slate-950 hover:text-slate-950"}`}
                >
                  {tab.label}
                </button>
              ))}
           </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
           
           {/* 📋 Partner Grid: Dense Visual Architecture */}
           <div className="lg:col-span-8">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {[1,2,3,4].map(i => <div key={i} className="h-80 bg-white border-4 border-slate-50 rounded-[3rem] animate-pulse" />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="h-96 bg-white border-4 border-slate-100 border-dashed rounded-[4rem] flex flex-col items-center justify-center text-slate-300">
                   <Building2 size={120} className="mb-6 opacity-10" />
                   <p className="text-2xl font-black opacity-30 italic">لا يوجد تجار بهذا التصنيف</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-bold">
                   <AnimatePresence mode="popLayout">
                     {filtered.map(v => (
                       <motion.div
                         layout
                         key={v.id}
                         initial={{ scale: 0.95, opacity: 0 }}
                         animate={{ scale: 1, opacity: 1 }}
                         exit={{ scale: 0.95, opacity: 0 }}
                         whileHover={{ y: -12, scale: 1.02 }}
                         onClick={() => setSelected(v)}
                         className={`p-10 rounded-[3.5rem] bg-white border-4 transition-all cursor-pointer group relative ${selected?.id === v.id ? 'border-primary shadow-3xl' : 'border-white hover:border-slate-950 shadow-xl shadow-slate-200/50'}`}
                       >
                         <div className="flex items-start justify-between mb-10">
                            <div className={`w-28 h-28 rounded-[2.5rem] border-4 flex items-center justify-center font-black text-5xl transition-all duration-300 ${selected?.id === v.id ? 'bg-slate-950 text-primary border-primary scale-110 rotate-3 shadow-2xl' : 'bg-slate-100 text-slate-400 border-slate-200 group-hover:bg-slate-950 group-hover:border-slate-950 group-hover:text-white group-hover:-rotate-3'}`}>
                               {v.fullName.charAt(0)}
                            </div>
                            <div className="flex flex-col items-end gap-3 pt-4">
                               {v.isVerified && (
                                 <span className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-2xl text-[12px] font-black border-2 border-slate-950 uppercase tracking-widest shadow-lg">OFFtoken <ShieldCheck size={18} /></span>
                               )}
                               {!v.isActive && (
                                 <span className="flex items-center gap-2 px-6 py-2.5 bg-rose-500 text-white rounded-2xl text-[12px] font-black border-2 border-slate-950 uppercase tracking-widest shadow-lg">Blocked <Ban size={18} /></span>
                               )}
                            </div>
                         </div>
                         
                         <div className="space-y-4">
                            <h3 className="text-3xl lg:text-4xl font-black text-slate-950 group-hover:text-primary transition-all leading-tight">{v.fullName}</h3>
                            <p className="text-lg text-slate-500 font-jakarta group-hover:text-slate-900 transition-colors">{v.email}</p>
                         </div>

                         <div className="mt-14 pt-10 border-t-4 border-slate-50 flex items-center justify-between">
                            <div className="flex flex-col gap-2">
                               <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">السيولة الحالية</span>
                               <span className="text-4xl font-black text-slate-950 tracking-tighter font-jakarta italic leading-none">{formatCurrency(v.walletBalance)}</span>
                            </div>
                            <div className="w-20 h-20 rounded-[2rem] bg-slate-950 flex items-center justify-center text-white shadow-3xl transition-all group-hover:bg-primary group-hover:text-slate-950 group-hover:scale-110">
                               <ChevronLeft size={44} />
                            </div>
                         </div>
                       </motion.div>
                     ))}
                   </AnimatePresence>
                </div>
              )}
           </div>

           {/* 🛡️ Vendor Auditor: High Resolution Compliance */}
           <AnimatePresence>
              {selected && (
                 <motion.aside
                    initial={{ x: 60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 60, opacity: 0 }}
                    className="lg:col-span-4 bg-slate-950 rounded-[4.5rem] p-12 shadow-[0_50px_120px_rgba(0,0,0,0.7)] text-white sticky top-40 space-y-12 border-l-8 border-primary overflow-hidden"
                 >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[150px] -mr-48 -mt-48" />
                    
                    <div className="flex items-center justify-between relative z-10">
                       <div className="flex items-center gap-8">
                          <div className="w-28 h-28 bg-primary rounded-[3rem] flex items-center justify-center text-slate-950 shadow-3xl border-4 border-white/10">
                             <Store size={56} />
                          </div>
                          <div>
                             <h2 className="text-3xl font-black tracking-tight">تدقيق الكيان</h2>
                             <p className="text-[12px] font-black text-white/30 uppercase tracking-[0.5em] mt-2">VENDOR_CONTROL: ACTIVE</p>
                          </div>
                       </div>
                       <button onClick={() => setSelected(null)} className="p-6 bg-white/5 hover:bg-white/20 rounded-[2.5rem] text-white transition-all active:scale-95 shadow-xl border-4 border-white/5">
                          <X size={40} />
                       </button>
                    </div>

                    <div className="space-y-12 relative z-10">
                       <div className="p-12 bg-white/5 border-2 border-white/10 rounded-[4rem] space-y-12">
                          <p className="text-[12px] font-black text-white/40 uppercase tracking-[0.4em]">بيانات الكيان التجاري</p>
                          <h3 className="text-5xl font-black leading-tight text-white mb-6 underline decoration-primary underline-offset-[12px]">{selected.fullName}</h3>
                          
                          <div className="flex flex-wrap gap-5 pt-6">
                             <div className={`px-10 py-4 rounded-2xl text-[12px] font-black border-4 ${selected.isActive ? 'bg-emerald-500 text-white border-slate-950 shadow-2xl' : 'bg-rose-500 text-white border-slate-950 shadow-2xl'}`}>
                                {selected.isActive ? 'تقييم نشط' : 'كيان محظور'}
                             </div>
                             {selected.isVerified && (
                                <div className="px-10 py-4 rounded-2xl text-[12px] font-black bg-white text-slate-950 border-4 border-slate-950 shadow-2xl tracking-tighter">AUTHENTICATED</div>
                             )}
                          </div>
                       </div>

                       <div className="space-y-6 px-4">
                          <VInfoLine icon={<Phone size={28} />} label="هاتف التواصل" value={selected.phone || 'غير مسجل'} />
                          <VInfoLine icon={<Mail size={28} />} label="المراسلات الرسمية" value={selected.email} />
                          <VInfoLine icon={<TrendingUp size={28} />} label="السيولة الإجمالية" value={formatCurrency(selected.walletBalance)} />
                          <VInfoLine icon={<Clock size={28} />} label="تاريخ الاعتماد" value={formatDate(selected.createdAt)} />
                       </div>
                    </div>

                    <div className="pt-16 border-t-8 border-white/5 space-y-8 relative z-10 px-4">
                       <div className="grid grid-cols-1 gap-8">
                          <Button 
                            onClick={() => doAction(selected.id, selected.isVerified ? "unverify" : "verify")}
                            className={`h-28 rounded-[3rem] font-black text-2xl flex items-center justify-center gap-8 transition-all active:scale-95 border-4 border-slate-950 ${selected.isVerified ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-primary text-slate-950 shadow-3xl shadow-primary/30 hover:scale-[1.03]'}`}
                          >
                             {selected.isVerified ? <ShieldAlert size={44} className="text-rose-400" /> : <ShieldCheck size={44} />}
                             {selected.isVerified ? "إلغاء اعتماد الشريك" : "منح الاعتماد الرسمي"}
                          </Button>
                          
                          <Button 
                            onClick={() => doAction(selected.id, selected.isActive ? "block" : "unblock")}
                            className={`h-24 rounded-[2.5rem] font-black text-lg border-4 transition-all active:scale-95 ${!selected.isActive ? 'bg-emerald-500 border-slate-950 text-white shadow-2xl' : 'bg-white/5 border-white/20 text-rose-500 hover:bg-rose-600 hover:text-white hover:border-slate-950 shadow-xl'}`}
                          >
                             {!selected.isActive ? <CheckCircle2 size={36} /> : <Ban size={36} />}
                             {!selected.isActive ? "إعادة تنشيط الكيان" : "تعليق العمليات فوراً"}
                          </Button>
                       </div>
                    </div>
                 </motion.aside>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function VStat({ label, val, icon: Icon, color, isCurrency, pulse, delay }: any) {
  return (
    <motion.div 
      initial={{ y: 30, opacity: 0 }} 
      animate={{ y: 0, opacity: 1 }} 
      transition={{ delay }}
      className="bg-white border-4 border-slate-950 p-12 rounded-[3.5rem] space-y-10 hover:shadow-[25px_25px_0px_#0f172a] hover:translate-x-[-12px] hover:translate-y-[-12px] transition-all duration-500 group relative overflow-hidden shadow-2xl shadow-slate-200/50"
    >
       <div className={`w-28 h-28 ${color} text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl border-4 border-slate-950 relative transition-transform duration-500 group-hover:rotate-12`}>
          <Icon size={48} />
          {pulse && <span className="absolute -top-4 -right-4 w-10 h-10 bg-white border-4 border-indigo-400 rounded-full flex items-center justify-center shadow-lg"><span className="w-5 h-5 bg-indigo-400 rounded-full animate-ping" /></span>}
       </div>
       <div className="space-y-3">
          <p className="text-[13px] font-black text-slate-500 uppercase tracking-[0.4em] font-jakarta">{label}</p>
          <p className="text-6xl font-black text-slate-950 font-jakarta tracking-tighter leading-none">
             {isCurrency ? formatCurrency(val).split('.')[0] : val}
          </p>
       </div>
    </motion.div>
  );
}

function VInfoLine({ icon, label, value, highlight }: { icon: any; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between p-8 bg-white/5 border-2 border-white/5 rounded-[2.5rem] group hover:border-white/20 transition-all shadow-xl">
       <div className="flex items-center gap-7">
          <span className="text-white/30 group-hover:text-primary transition-colors">{icon}</span>
          <span className="text-[13px] font-black text-white/40 uppercase tracking-[0.2em]">{label}</span>
       </div>
       <span className={`text-lg font-black ${highlight ? 'text-amber-400' : 'text-white/90'} group-hover:text-white transition-all font-jakarta`}>{value}</span>
    </div>
  );
}
