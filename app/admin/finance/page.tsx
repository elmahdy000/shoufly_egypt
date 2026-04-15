"use client";

import { useState, useMemo } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  FiDollarSign, FiArrowUpRight, FiArrowDownLeft, FiSearch,
  FiX, FiUser, FiCalendar, FiHash, FiFileText,
  FiActivity, FiTarget, FiCreditCard, FiChevronLeft,
  FiDownload, FiClock, FiCheckCircle, FiInbox
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const TX_TYPE_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  WALLET_TOPUP:     { label: "شحن محفظة",     icon: FiArrowDownLeft, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ESCROW_DEPOSIT:   { label: "إيداع ضمان",     icon: FiTarget,        color: "text-orange-500",    bg: "bg-orange-500/10"    },
  ESCROW_RELEASE:   { label: "إفراج ضمان",     icon: FiCheckCircle,   color: "text-orange-500",  bg: "bg-orange-500/10"  },
  WITHDRAWAL:       { label: "سحب نقدي",       icon: FiArrowUpRight,  color: "text-rose-500",    bg: "bg-rose-500/10"    },
  REFUND:           { label: "مبلغ مسترد",     icon: FiRefreshCcw,    color: "text-orange-500",  bg: "bg-orange-500/10"  },
  PLATFORM_FEE:     { label: "عمولة منصة",   icon: FiCreditCard,    color: "text-slate-400",   bg: "bg-slate-500/10"   },
};

function FiRefreshCcw(props: any) { return <FiActivity {...props} />; }

export default function AdminFinancePage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [selected, setSelected] = useState<any>(null);

  const { data: transactions, loading } = useAsyncData<any[]>(
    () => apiFetch("/api/admin/finance/transactions", "ADMIN"), []
  );

  const filtered = useMemo(() => {
    let list = transactions ?? [];
    if (typeFilter !== "ALL") list = list.filter((t: any) => t.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t: any) =>
        t.user?.fullName?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        String(t.id).includes(q)
      );
    }
    return list;
  }, [transactions, typeFilter, search]);

  const stats = useMemo(() => {
    const all = transactions ?? [];
    const total = all.reduce((s: number, t: any) => s + Number(t.amount), 0);
    const topups = all.filter((t: any) => t.type === "WALLET_TOPUP").reduce((s: number, t: any) => s + Number(t.amount), 0);
    const withdrawals = all.filter((t: any) => t.type === "WITHDRAWAL").reduce((s: number, t: any) => s + Number(t.amount), 0);
    const fees = all.filter((t: any) => t.type === "PLATFORM_FEE").reduce((s: number, t: any) => s + Number(t.amount), 0);
    return { total, topups, withdrawals, fees, count: all.length };
  }, [transactions]);

  return (
    <div className="admin-page admin-page--spacious" dir="rtl">
      
      {/* Architectural Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-slate-100 pb-10">
        <div>
           <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-xs font-black text-slate-400 tracking-wide">المراجعة المالية</span>
           </div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">السجل <span className="text-slate-300 font-light">/</span> المالي للمنصة</h1>
        </div>
        
        <div className="flex items-center gap-3">
           <button className="h-11 px-6 bg-slate-900 text-white rounded-xl text-xs font-black tracking-wide shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center gap-2">
              <FiDownload size={14} /> تصدير التقرير الكامل
           </button>
        </div>
      </div>

      {/* 📊 High-Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <EliteMetric label="إجمالي الحركات" val={stats.count} icon={FiActivity} />
         <EliteMetric label="عمليات الشحن" val={stats.topups} icon={FiArrowDownLeft} isCurrency accent />
         <EliteMetric label="عمليات السحب" val={stats.withdrawals} icon={FiArrowUpRight} isCurrency />
         <EliteMetric label="أرباح المنصة" val={stats.fees} icon={FiDollarSign} isCurrency />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
         <div className="relative flex-1 group">
            <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث برقم القيد، اسم المستفيد، أو الوصف العملي..."
              className="w-full pr-11 pl-4 h-11 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:bg-white focus:border-primary outline-none transition-all shadow-sm"
            />
         </div>
         <select
           value={typeFilter}
           onChange={(e) => setTypeFilter(e.target.value)}
           className="h-11 px-6 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-700 outline-none transition-all shadow-sm min-w-[220px]"
         >
           <option value="ALL">كافة أنواع العمليات</option>
           {Object.entries(TX_TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
         </select>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
         <div className="flex-1 w-full bg-white border border-slate-100 rounded-xl shadow-xl shadow-slate-200/20 overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-right">
                  <thead>
                     <tr className="border-b border-slate-50 bg-slate-50/50">
                        <th className="px-8 py-5 text-xs font-black text-slate-400 tracking-wide leading-none">المستفيد</th>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 tracking-wide text-center leading-none">التصنيف</th>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 tracking-wide leading-none">القيمة</th>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 tracking-wide leading-none">المرجع</th>
                        <th className="px-8 py-5 text-xs font-black text-slate-400 tracking-wide text-left leading-none">تفاصيل</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {loading ? (
                        Array(6).fill(0).map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={5} className="h-16 bg-slate-50/20" /></tr>)
                     ) : filtered.length === 0 ? (
                        <tr><td colSpan={5} className="py-24 text-center"><FiInbox size={48} className="mx-auto text-slate-200 mb-4" /><p className="text-xs font-black text-slate-300 tracking-wide">لا توجد معاملات مسجلة</p></td></tr>
                     ) : (
                        filtered.map((t: any) => (
                           <tr key={t.id} className={`group cursor-pointer transition-all ${selected?.id === t.id ? 'bg-primary/5' : 'hover:bg-slate-50/50'}`} onClick={() => setSelected(t)}>
                              <td className="px-8 py-5">
                                 <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all ${selected?.id === t.id ? 'bg-primary text-white' : 'bg-slate-50 text-slate-300 group-hover:bg-slate-900 group-hover:text-white'}`}>
                                       <FiUser size={18} />
                                    </div>
                                    <div>
                                       <p className="text-sm font-black text-slate-900 leading-none mb-1.5">{t.user?.fullName ?? "إدارة النظام"}</p>
                                       <p className="text-xs font-bold text-slate-400 italic font-mono">{formatDate(t.createdAt)}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-5 text-center">
                                 <EliteTypeBadge type={t.type} />
                              </td>
                              <td className="px-8 py-5">
                                 <span className={`text-sm font-black italic font-mono tracking-tighter ${["WALLET_TOPUP", "REFUND", "ESCROW_RELEASE"].includes(t.type) ? "text-emerald-500" : "text-slate-900"}`}>
                                    {formatCurrency(Number(t.amount))}
                                 </span>
                              </td>
                              <td className="px-8 py-5"><span className="text-xs font-black text-slate-300 font-mono tracking-wide px-2 py-1 bg-slate-50 rounded">TX_{t.id}</span></td>
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

         {/* Elite Financial Audit Panel */}
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
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-primary"><FiClock size={24} /></div>
                        <div>
                           <h2 className="text-base font-black tracking-tight">تفاصيل العمليات</h2>
                           <p className="text-xs font-bold text-slate-500 tracking-wide mt-1">بيانات العملية</p>
                        </div>
                     </div>
                     <button onClick={() => setSelected(null)} className="p-2 hover:bg-white/10 rounded-xl text-slate-500 transition-all"><FiX size={20} /></button>
                  </div>

                  <div className="space-y-8">
                     <div className="p-8 bg-white/5 border border-white/5 rounded-xl relative overflow-hidden">
                        <p className="text-xs text-slate-500 font-black tracking-wide mb-3">قيمة العملية الصافية</p>
                        <p className={`text-4xl font-black font-mono tracking-tighter ${["WALLET_TOPUP", "REFUND", "ESCROW_RELEASE"].includes(selected.type) ? "text-emerald-400" : "text-white"}`}>
                           {formatCurrency(Number(selected.amount))}
                        </p>
                        <div className="mt-4 flex justify-between items-center">
                           <EliteTypeBadge type={selected.type} dark />
                           <span className="text-xs font-black text-emerald-400 tracking-wide flex items-center gap-2">
                              <FiCheckCircle size={12} /> Verified
                           </span>
                        </div>
                     </div>

                     <div className="space-y-3">
                        <AuditDetail icon={<FiHash />} label="رقم المرجع المالي" val={`TXN-00${selected.id}`} />
                        <AuditDetail icon={<FiUser />} label="الطرف المستلم" val={selected.user?.fullName ?? 'System'} />
                        <AuditDetail icon={<FiCalendar />} label="تاريخ المعالجة" val={formatDate(selected.createdAt)} />
                     </div>
                  </div>

                  {selected.description && (
                     <div className="p-6 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                        <p className="text-xs font-black text-slate-500 tracking-wide mb-3">وصف المعاملة التقني</p>
                        <p className="text-xs font-bold text-slate-300 leading-relaxed font-mono">{selected.description}</p>
                     </div>
                   )}

                  <div className="pt-8 border-t border-white/5">
                     <button className="w-full h-14 bg-white text-slate-900 rounded-2xl text-sm font-black tracking-wide hover:bg-slate-200 transition-all shadow-lg flex items-center justify-center gap-3">
                        تحميل إيصال الضريبة <FiDownload size={16} />
                     </button>
                  </div>
               </motion.aside>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
}

function EliteMetric({ label, val, icon: Icon, isCurrency, accent }: any) {
  return (
    <div className="bg-white border border-slate-100 p-8 rounded-xl space-y-5 hover:border-primary/20 transition-all duration-500 group shadow-sm">
       <div className={`w-14 h-14 ${accent ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-slate-50 text-slate-300 group-hover:bg-slate-900 group-hover:text-white'} rounded-2xl flex items-center justify-center transition-all duration-500`}>
          <Icon size={24} />
       </div>
       <div>
          <p className="text-xs font-black text-slate-300 tracking-wide mb-1.5">{label}</p>
          <p className="text-2xl font-black text-slate-900 font-mono tracking-tighter">
             {isCurrency ? formatCurrency(val).split(' ')[0] : val}
          </p>
       </div>
    </div>
  );
}

function EliteTypeBadge({ type, dark }: { type: string; dark?: boolean }) {
  const cfg = TX_TYPE_CONFIG[type] || { label: type, icon: FiActivity, color: "text-slate-400", bg: "bg-slate-500/10" };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black border tracking-wide ${dark ? 'bg-white/10 text-white border-white/5' : `${cfg.bg} ${cfg.color} border-current/10`}`}>
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

