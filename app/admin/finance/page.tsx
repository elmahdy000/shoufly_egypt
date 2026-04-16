"use client";

import { useMemo, useState } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  TrendingUp, TrendingDown, DollarSign, 
  Search, Calendar, Filter, Download,
  ArrowUpRight, ArrowDownRight, CreditCard,
  History, ShieldCheck, X, FileText,
  PieChart, Activity, Wallet
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Transaction {
  id: number;
  amount: number;
  type: "IN" | "OUT";
  description: string;
  status: string;
  createdAt: string;
}

export default function AdminFinancePage() {
  const [filter, setFilter] = useState("ALL");
  const [selected, setSelected] = useState<Transaction | null>(null);

  const { data: transactions, loading } = useAsyncData<Transaction[]>(
    () => apiFetch("/api/admin/finance/transactions", "ADMIN"),
    []
  );

  const stats = useMemo(() => {
    const list = transactions ?? [];
    const totalIn = list.filter(t => t.type === "IN").reduce((s, t) => s + t.amount, 0);
    const totalOut = list.filter(t => t.type === "OUT").reduce((s, t) => s + t.amount, 0);
    return { income: totalIn, expense: totalOut, net: totalIn - totalOut };
  }, [transactions]);

  return (
    <div className="min-h-full bg-[#F1F5F9] pb-32 font-sans text-right" dir="rtl">
      
      {/* 🚀 Header: Financial Control Hub */}
      <section className="bg-slate-950 text-white border-b-8 border-emerald-500 sticky top-0 z-40 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] -mr-40 -mt-40 opacity-50" />
        <div className="w-full px-8 lg:px-12 py-10 relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                <span className="text-[11px] font-black tracking-[0.4em] text-emerald-400 uppercase">نظام التدقيق المالي v3.4</span>
             </div>
             <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase">الخزانة <span className="text-emerald-400 italic">المركزية</span></h1>
             <p className="text-lg text-slate-400 font-bold max-w-2xl leading-relaxed">رقابة شاملة على التدفقات النقدية، إدارة الميزانية، وتدقيق العمليات المالية بكثافة بصرية عالية.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
             <div className="relative group w-full sm:w-[400px]">
                <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-all" size={24} />
                <input
                  placeholder="بحث في قيود العمليات..."
                  className="w-full pr-16 pl-6 h-16 bg-white/10 border-4 border-white/10 rounded-2xl text-xl font-bold text-white focus:bg-white focus:text-slate-950 focus:border-emerald-600 outline-none transition-all placeholder:text-slate-600"
                />
             </div>
             <button className="h-16 px-10 rounded-2xl bg-white text-slate-950 font-black border-4 border-slate-950 shadow-[8px_8px_0px_rgba(0,0,0,0.1)] hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3">
                <Download size={24} /> استخراج تقارير
             </button>
          </div>
        </div>
      </section>

      <div className="w-full px-8 lg:px-12 py-12 space-y-12">
        
        {/* 📊 Balance Summary: Ultra Bold */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <FinMetric label="صافي المحفظة" val={stats.net} icon={Wallet} color="bg-slate-900" net />
           <FinMetric label="إجمالي الإيرادات" val={stats.income} icon={TrendingUp} color="bg-emerald-600" />
           <FinMetric label="إجمالي المصروفات" val={stats.expense} icon={TrendingDown} color="bg-rose-600" />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
           
           {/* 📋 Ledger Entries: High Resolution Contrast */}
           <div className="lg:col-span-8 bg-white border-4 border-slate-950 rounded-[3rem] shadow-[25px_25px_0px_rgba(15,23,42,0.04)] overflow-hidden font-bold">
              <div className="px-10 py-8 border-b-4 border-slate-50 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-white shadow-xl">
                       <History size={28} />
                    </div>
                    <div>
                       <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tight">سجل المعاملات</h2>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Audit Trail Active</p>
                    </div>
                 </div>
              </div>
              
              <div className="overflow-x-auto">
                 <table className="w-full text-right border-collapse">
                    <thead>
                       <tr className="bg-slate-50 border-b border-slate-100 italic">
                          <th className="px-10 py-8 text-[11px] font-black uppercase tracking-widest">نوع العملية</th>
                          <th className="px-10 py-8 text-[11px] font-black uppercase tracking-widest">تاريخ القيد</th>
                          <th className="px-10 py-8 text-[11px] font-black uppercase tracking-widest">الوصف</th>
                          <th className="px-10 py-8 text-[11px] font-black uppercase tracking-widest text-left">القيمة</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y-4 divide-slate-50">
                       {loading ? (
                         [1,2,3,4,5].map(i => <tr key={i} className="animate-pulse"><td colSpan={4} className="h-28 bg-slate-50/50" /></tr>)
                       ) : transactions?.length === 0 ? (
                         <tr><td colSpan={4} className="py-32 text-center text-slate-300 text-3xl font-black italic opacity-20">لا توجد حركات مالية مسجلة</td></tr>
                       ) : (
                         transactions!.map(tx => (
                           <tr 
                             key={tx.id} 
                             onClick={() => setSelected(tx)}
                             className={`group cursor-pointer transition-all ${selected?.id === tx.id ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
                           >
                              <td className="px-10 py-8">
                                 <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 ${tx.type === 'IN' ? 'bg-emerald-500 text-white border-slate-950' : 'bg-rose-500 text-white border-slate-950'}`}>
                                       {tx.type === 'IN' ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                                    </div>
                                    <span className="text-base font-black text-slate-950">{tx.type === 'IN' ? 'وارد' : 'صادر'}</span>
                                 </div>
                              </td>
                              <td className="px-10 py-8 text-sm font-bold text-slate-400 font-jakarta uppercase">{formatDate(tx.createdAt)}</td>
                              <td className="px-10 py-8 text-lg font-black text-slate-950">{tx.description}</td>
                              <td className={`px-10 py-8 text-left font-jakarta text-2xl font-black tracking-tighter italic ${tx.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                 {tx.type === 'IN' ? '+' : '-'}{formatCurrency(tx.amount)}
                              </td>
                           </tr>
                         ))
                       )}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* 🛡️ Audit Inspector: Tactical Ledger Detail */}
           <AnimatePresence>
              {selected && (
                 <motion.aside
                    initial={{ x: 60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 60, opacity: 0 }}
                    className="lg:col-span-4 bg-slate-950 rounded-[4rem] p-12 shadow-3xl text-white sticky top-40 border-l-8 border-emerald-500 overflow-hidden"
                 >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[150px] -mr-48 -mt-48" />
                    
                    <div className="flex items-center justify-between relative z-10 mb-12">
                       <h2 className="text-3xl font-black tracking-tight">تدقيق العملية</h2>
                       <button onClick={() => setSelected(null)} className="p-5 bg-white/5 hover:bg-rose-500 rounded-3xl text-white transition-all shadow-xl"><X size={32} /></button>
                    </div>

                    <div className="space-y-12 relative z-10">
                       <div className="p-10 bg-white/5 border-2 border-white/10 rounded-[3.5rem] space-y-8">
                          <p className="text-[12px] font-black text-white/30 uppercase tracking-[0.4em]">القيد المالي #TX_{selected.id}</p>
                          <div className="space-y-4">
                             <h4 className="text-5xl font-black tracking-tighter italic font-jakarta leading-none">{formatCurrency(selected.amount)}</h4>
                             <p className={`text-xl font-black uppercase flex items-center gap-3 ${selected.type === 'IN' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {selected.type === 'IN' ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                                {selected.type === 'IN' ? 'تحويل وارد' : 'تحويل صادر'}
                             </p>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 gap-6 px-4">
                          <FDetailBox icon={<Calendar size={28} />} label="تاريخ التنفيذ" value={formatDate(selected.createdAt)} />
                          <FDetailBox icon={<FileText size={28} />} label="وصف القيد" value={selected.description} highlight />
                          <FDetailBox icon={<ShieldCheck size={28} />} label="الحالة الأمنية" value="عملية موثقة" />
                       </div>
                    </div>

                    <div className="pt-16 border-t-8 border-white/5 space-y-6 relative z-10 px-4">
                       <button className="w-full h-24 bg-emerald-500 text-slate-950 rounded-[2.5rem] font-black text-2xl border-4 border-slate-950 shadow-3xl hover:translate-y-[-4px] transition-all active:scale-95 flex items-center justify-center gap-6 uppercase tracking-tighter">
                          <Download size={36} /> استخراج الفاتورة
                       </button>
                    </div>
                 </motion.aside>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function FinMetric({ label, val, icon: Icon, color, net }: any) {
  return (
    <motion.div 
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white border-4 border-slate-950 p-12 rounded-[4rem] space-y-10 hover:shadow-[25px_25px_0px_#0f172a] hover:translate-y-[-12px] transition-all duration-500 group relative overflow-hidden shadow-2xl shadow-slate-200/50"
    >
       <div className={`w-20 h-20 ${color} text-white rounded-[2rem] flex items-center justify-center shadow-2xl border-4 border-slate-950 transition-transform group-hover:rotate-12`}>
          <Icon size={40} />
       </div>
       <div className="space-y-4">
          <p className="text-[14px] font-black text-slate-500 uppercase tracking-[0.4em]">{label}</p>
          <p className={`text-5xl font-black font-jakarta tracking-tighter leading-none ${net && val < 0 ? 'text-rose-600' : 'text-slate-950'}`}>
             {formatCurrency(val).split('.')[0]}
          </p>
       </div>
    </motion.div>
  );
}

function FDetailBox({ icon, label, value, highlight }: any) {
  return (
    <div className="flex items-center justify-between p-8 bg-white/5 border-2 border-white/5 rounded-[2.5rem] group hover:border-white/20 transition-all">
       <div className="flex items-center gap-6">
          <span className="text-white/20 group-hover:text-emerald-400 transition-colors">{icon}</span>
          <span className="text-[12px] font-black text-white/30 uppercase tracking-widest">{label}</span>
       </div>
       <span className={`text-xl font-black ${highlight ? 'text-emerald-400' : 'text-white/95'} font-jakarta`}>{value}</span>
    </div>
  );
}
