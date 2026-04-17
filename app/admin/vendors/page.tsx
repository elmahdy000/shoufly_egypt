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
    <div className="min-h-full bg-slate-50 pb-20 font-sans text-right" dir="rtl">
      
      {/* 🚀 Header: Modern & Clean */}
      <section className="bg-white border-b border-slate-200 sticky top-0 z-40 overflow-hidden">
        <div className="px-6 lg:px-10 py-8 relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-1">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">إدارة الكيانات والشركات المعتمدة</span>
             </div>
             <h1 className="text-2xl font-bold tracking-tight text-slate-900 border-r-4 border-orange-500 pr-4">بوابة <span className="text-orange-600">التجار</span></h1>
             <p className="text-sm text-slate-500 font-medium max-w-xl">تحكّم كامل في متاجر المنصة، متابعة أرصدة المحافظ، واعتماد الوثائق الرسمية للشركاء.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
             <div className="relative group w-full sm:w-[350px]">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-all" size={18} />
                <input
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   placeholder="ابحث باسم المتجر أو المالك..."
                   className="w-full pr-12 pl-4 h-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:border-orange-500 outline-none transition-all placeholder:text-slate-400"
                />
             </div>
             <button onClick={handleRefresh} className="p-3 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-orange-600 hover:border-orange-200 transition-all">
                <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
             </button>
          </div>
        </div>
      </section>

      <div className="px-6 lg:px-10 py-8 space-y-8">
        
        {/* 📊 KPI Strip */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <VStat label="إجمالي الشركاء" val={stats.total} icon={Store} color="text-slate-600 bg-slate-100" />
          <VStat label="متاجر معتمدة" val={stats.verified} icon={ShieldCheck} color="text-orange-600 bg-orange-50" />
          <VStat label="إجمالي المحافظ" val={stats.totalWallet} icon={CreditCard} color="text-emerald-600 bg-emerald-50" isCurrency />
          <VStat label="تجار موقوفين" val={stats.total - stats.active} icon={Ban} color="text-rose-600 bg-rose-50" />
        </section>

        {/* 🛠 Filter Control Bridge */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
           <div className="flex flex-wrap items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center ml-2 border border-slate-100">
                 <Filter size={16} />
              </div>
              {([{ id: "ALL", label: "كل المتاجر" }, { id: "ACTIVE", label: "نشط حالياً" }, { id: "VERIFIED", label: "موثقين فقط" }, { id: "BLOCKED", label: "موقوفين" }] as { id: VendorFilter; label: string }[]).map((tab) => (
                <button 
                  key={tab.id} 
                  onClick={() => setStatusFilter(tab.id)} 
                  className={`px-6 py-2 rounded-lg text-xs font-bold border transition-all ${statusFilter === tab.id ? "bg-orange-600 text-white border-orange-600 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"}`}
                >
                  {tab.label}
                </button>
              ))}
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           
           {/* 📋 Partner Grid */}
           <div className="lg:col-span-8">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {[1,2,3,4].map(i => <div key={i} className="h-64 bg-white border border-slate-200 rounded-2xl animate-pulse" />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="h-80 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-4">
                   <Building2 size={48} className="opacity-20" />
                   <p className="text-base font-bold">لا يوجد تجار بهذا التصنيف</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <AnimatePresence mode="popLayout">
                     {filtered.map(v => (
                       <motion.div
                         layout
                         key={v.id}
                         initial={{ opacity: 0, scale: 0.98 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.95 }}
                         onClick={() => setSelected(v)}
                         className={`p-6 rounded-2xl bg-white border transition-all cursor-pointer group flex flex-col justify-between shadow-sm min-h-[260px] ${selected?.id === v.id ? 'border-orange-500 ring-2 ring-orange-500/10' : 'border-slate-200 hover:border-orange-400 hover:shadow-md'}`}
                       >
                         <div>
                            <div className="flex items-start justify-between mb-6">
                               <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl transition-all ${selected?.id === v.id ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'bg-slate-100 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-600'}`}>
                                  {v.fullName.charAt(0)}
                               </div>
                               <div className="flex flex-col items-end gap-2">
                                 {v.isVerified && (
                                   <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[9px] font-bold border border-emerald-200 uppercase tracking-tighter">موثق <ShieldCheck size={12} /></span>
                                 )}
                                 {!v.isActive && (
                                   <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-700 rounded-lg text-[9px] font-bold border border-rose-200 uppercase tracking-tighter">محظور <Ban size={12} /></span>
                                 )}
                               </div>
                            </div>
                            
                            <div className="space-y-1">
                               <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-orange-600 transition-colors">{v.fullName}</h3>
                               <p className="text-xs text-slate-400 font-medium truncate">{v.email}</p>
                            </div>
                         </div>

                         <div className="mt-8 pt-4 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex flex-col">
                               <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider leading-none">السيولة</span>
                               <span className="text-xl font-bold text-slate-900 font-jakarta mt-1 leading-none">{formatCurrency(v.walletBalance)}</span>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 transition-all group-hover:bg-orange-600 group-hover:text-white">
                               <ChevronLeft size={18} />
                            </div>
                         </div>
                       </motion.div>
                     ))}
                   </AnimatePresence>
                </div>
              )}
           </div>

           {/* 🛡️ Vendor Auditor */}
           <AnimatePresence>
              {selected ? (
                 <motion.aside
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="lg:col-span-4 bg-white rounded-2xl p-8 border border-slate-200 shadow-xl sticky top-28 space-y-8 overflow-hidden"
                 >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-6 text-slate-900">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center text-orange-600 shadow-sm">
                             <Store size={24} />
                          </div>
                          <div>
                             <h2 className="text-lg font-bold">تدقيق الكيان</h2>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">تحكم الموردين: نشط</p>
                          </div>
                       </div>
                       <button onClick={() => setSelected(null)} className="p-2 bg-slate-100 hover:bg-rose-100 rounded-lg text-slate-400 hover:text-rose-600 transition-all active:scale-95"><X size={18} /></button>
                    </div>

                    <div className="space-y-6">
                       <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">بيانات الكيان التجاري</p>
                          <h3 className="text-2xl font-bold leading-tight text-slate-900">{selected.fullName}</h3>
                          
                          <div className="flex flex-wrap gap-2 pt-2">
                             <div className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${selected.isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
                                {selected.isActive ? 'تقييم نشط' : 'كيان محظور'}
                             </div>
                             {selected.isVerified && (
                                <div className="px-3 py-1 rounded-lg text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200">موثق</div>
                             )}
                          </div>
                       </div>

                       <div className="space-y-2">
                          <VInfoLine icon={<Phone size={16} />} label="هاتف التواصل" value={selected.phone || 'غير مسجل'} />
                          <VInfoLine icon={<Mail size={16} />} label="المراسلات الرسمية" value={selected.email} />
                          <VInfoLine icon={<TrendingUp size={16} />} label="السيولة الإجمالية" value={formatCurrency(selected.walletBalance)} />
                          <VInfoLine icon={<Clock size={16} />} label="تاريخ الاعتماد" value={formatDate(selected.createdAt)} />
                       </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 space-y-3">
                       <button 
                         onClick={() => doAction(selected.id, selected.isVerified ? "unverify" : "verify")}
                         className={`w-full h-14 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all active:scale-[0.98] border shadow-sm ${selected.isVerified ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50' : 'bg-orange-600 text-white border-orange-700 hover:bg-orange-700'}`}
                       >
                          {selected.isVerified ? <ShieldAlert size={20} className="text-rose-500" /> : <ShieldCheck size={20} />}
                          {selected.isVerified ? "إلغاء اعتماد الشريك" : "منح الاعتماد الرسمي"}
                       </button>
                       
                       <button 
                         onClick={() => doAction(selected.id, selected.isActive ? "block" : "unblock")}
                         className={`w-full h-12 rounded-xl font-bold text-xs border transition-all active:scale-[0.98] ${!selected.isActive ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700' : 'bg-white border-rose-200 text-rose-600 hover:bg-rose-50'}`}
                       >
                          {!selected.isActive ? <CheckCircle2 size={18} /> : <Ban size={18} />}
                          {!selected.isActive ? "إعادة تنشيط الكيان" : "تعليق العمليات فوراً"}
                       </button>

                       <button className="w-full h-11 text-slate-400 hover:text-slate-600 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                          <ExternalLink size={14} /> فتح سجل النشاط
                       </button>
                    </div>
                 </motion.aside>
              ) : (
                <div className="lg:col-span-4 h-[400px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-4">
                   <Building2 size={48} className="opacity-20" />
                   <p className="text-sm font-medium">اختر تاجراً لعرض تفاصيل الكيان</p>
                </div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function VStat({ label, val, icon: Icon, color, isCurrency }: any) {
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-5 shadow-sm hover:shadow-md transition-all">
       <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-sm border border-black/5`}>
          <Icon size={22} />
       </div>
       <div className="space-y-0.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</p>
          <p className="text-2xl font-bold text-slate-900 leading-none mt-1">
             {isCurrency ? formatCurrency(val).split('.')[0] : val}
          </p>
       </div>
    </div>
  );
}

function VInfoLine({ icon, label, value, highlight }: { icon: any; label: string; value: string; highlight?: boolean }) {
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
