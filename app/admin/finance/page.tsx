"use client";

import { useMemo } from "react";
import { StatCard } from "@/components/shoofly/stat-card";
import { Button } from "@/components/shoofly/button";
import { StatusBadge } from "@/components/shoofly/status-badge";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { listAdminTransactions } from "@/lib/api/transactions";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { FiDollarSign, FiTrendingUp, FiArrowDownLeft, FiArrowUpRight, FiSearch, FiFilter, FiActivity, FiShield, FiArrowLeft } from "react-icons/fi";

export default function AdminFinancePage() {
  const { data, loading, error } = useAsyncData(() => listAdminTransactions(), []);
  
  if (error) {
    console.error("Finance API Error:", error);
  }
  
  // حساب الإحصائيات المالية ديناميكياً
  const financeStats = useMemo(() => {
    const transactions = data ?? [];
    const commission = transactions
      .filter((tx: any) => tx.type === "PLATFORM_COMMISSION" || tx.type === "COMMISSION")
      .reduce((sum: number, tx: any) => sum + Number(tx.amount || 0), 0);
    const totalVolume = transactions
      .reduce((sum: number, tx: any) => sum + Number(tx.amount || 0), 0);
    return {
      totalTransactions: transactions.length,
      commission,
      liquidity: totalVolume - commission, // rough estimate
    };
  }, [data]);

  return (
    <div className="p-8 lg:p-12 max-w-[1600px] mx-auto space-y-8 dir-rtl text-right font-sans">
      {/* Error Display */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
          <p className="font-bold">خطأ في تحميل البيانات:</p>
          <p>{error}</p>
          <p className="mt-2 text-xs">تأكد من تسجيل الدخول كـ Admin</p>
        </div>
      )}
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">الخزينة المركزية</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">تتبع دقيق لجميع التدفقات المالية داخل النظام.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative group">
             <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-all" />
             <input 
               type="text" 
               placeholder="ابحث برقم المعاملة..." 
               className="pr-12 pl-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none w-64 focus:border-primary transition-all"
             />
           </div>
           <Button variant="secondary" className="h-12 px-4 rounded-xl">
             <FiFilter size={18} />
           </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard 
          title="إجمالي الحركات" 
          value={loading ? '...' : financeStats.totalTransactions} 
          icon={<FiDollarSign size={20} />} 
          className="bg-white border border-slate-200 shadow-sm"
        />
        <StatCard 
          title="دخل شوفلي" 
          value={loading ? '...' : formatCurrency(financeStats.commission)} 
          icon={<FiTrendingUp size={20} className="text-emerald-500" />} 
          className="bg-white border border-slate-200 shadow-sm"
        />
        <StatCard 
          title="السيولة المتاحة" 
          value={loading ? '...' : formatCurrency(financeStats.liquidity)} 
          icon={<FiActivity size={20} className="text-primary" />} 
          className="bg-white border border-slate-200 shadow-sm"
        />
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500">المعاملة</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500">المستخدم</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500">القيمة</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 text-center">التاريخ</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500">النوع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center text-slate-400 text-sm font-medium">جاري تحميل المعاملات...</td></tr>
              ) : (data ?? []).length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-slate-400 text-sm font-medium">لا توجد معاملات بعد</td></tr>
              ) : (data ?? []).map((tx: any) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                         tx.amount > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                       }`}>
                         {tx.amount > 0 ? <FiArrowUpRight size={18} /> : <FiArrowDownLeft size={18} />}
                       </div>
                       <div>
                         <p className="font-semibold text-slate-900 text-sm">#{tx.id}</p>
                       </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-medium text-slate-700">{tx.user?.fullName || "مستخدم"}</p>
                    <p className="text-xs text-slate-400">{tx.user?.role || "-"}</p>
                  </td>
                  <td className={`py-4 px-6 font-medium ${
                    tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <p className="text-xs text-slate-500">{formatDate(tx.createdAt)}</p>
                  </td>
                  <td className="py-4 px-6">
                     <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-600">
                       {tx.type}
                     </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
