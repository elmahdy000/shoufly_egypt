"use client";

import React from 'react';
import Link from 'next/link';
import { StatCard } from "@/components/shoofly/stat-card";
import { formatCurrency } from "@/lib/formatters";
import { listAdminTransactions } from "@/lib/api/transactions";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { 
  FiPackage, 
  FiUsers, 
  FiTrendingUp, 
  FiDollarSign,
  FiActivity,
  FiSettings,
  FiShield,
  FiArrowUpRight,
  FiCreditCard
} from "react-icons/fi";
import type { ApiTransaction } from "@/lib/types/api";

interface AdminStats {
  revenue: number;
  growthRate: number;
  totalUsers: number;
  openRequests: number;
}

const AdminDashboard = () => {
  const { data: stats, loading: statsLoading, error: statsError } = useAsyncData<AdminStats>(() => apiFetch("/api/admin/stats", "ADMIN"), []);
  const { data: txs, loading: txLoading, error: txError } = useAsyncData<ApiTransaction[]>(() => listAdminTransactions(), []);
  
  // Debug errors - only log when there's an actual error message
  const errorMessage = statsError || txError;
  const hasRealError = errorMessage && typeof errorMessage === 'string' && errorMessage.trim().length > 0;
  if (hasRealError) {
    console.error("API Error:", errorMessage);
  }
  
  return (
    <div className="max-w-[1600px] mx-auto space-y-8 font-sans dir-rtl text-right">
      {/* Error Display */}
      {hasRealError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
          <p className="font-bold">خطأ في تحميل البيانات:</p>
          <p>{statsError || txError}</p>
          <p className="mt-2 text-xs">تأكد من تسجيل الدخول كـ Admin</p>
        </div>
      )}
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">نظرة عامة</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">ملخص الأداء المالي والعمليات خلال 30 يوماً الماضية</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Main Revenue Card */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-slate-900/20">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
             <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl opacity-50" />
             <div className="absolute bottom-[-10%] right-[-5%] w-48 h-48 bg-blue-500/10 rounded-full blur-2xl opacity-50" />
          </div>
          
          <div className="relative z-10 flex flex-col h-full justify-between gap-8">
             <div className="flex justify-between items-start">
               <div className="space-y-1">
                 <p className="text-slate-400 text-sm font-medium">إجمالي الإيرادات</p>
                 <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
                   {statsLoading ? '...' : formatCurrency(stats?.revenue || 0).split(' ')[0]} 
                   <span className="text-lg font-medium text-slate-400 mr-2">ج.م</span>
                 </h2>
               </div>
               <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-primary backdrop-blur-sm border border-white/5">
                 <FiDollarSign size={24} />
               </div>
             </div>
             
             <div className="flex justify-between items-end">
               <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <FiTrendingUp className="text-emerald-400" size={14} /> 
                  <span className="text-emerald-400 font-semibold text-xs text-left" dir="ltr">+{stats?.growthRate || 0}% / mo</span>
               </div>
               <Link href="/admin/finance" className="text-slate-300 hover:text-white flex items-center gap-1 text-sm font-medium transition-colors">
                  التقارير <FiArrowUpRight size={16} />
               </Link>
             </div>
          </div>
        </div>

        {/* Secondary Stat Cards */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-sm font-medium text-slate-500 mb-1">المستخدمين النشطين</p>
               <h3 className="text-3xl font-bold text-slate-900">{statsLoading ? "..." : (stats?.totalUsers ?? 0)}</h3>
             </div>
             <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
               <FiUsers size={20} />
             </div>
           </div>
           <p className="text-xs font-medium text-slate-500 mt-4 flex items-center gap-1">
             يوزر نشط عالمنصة
           </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
           <div className="flex justify-between items-start">
             <div>
               <p className="text-sm font-medium text-slate-500 mb-1">طلبات قيد المراجعة</p>
               <h3 className="text-3xl font-bold text-slate-900">{statsLoading ? "..." : (stats?.openRequests ?? 0)}</h3>
             </div>
             <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
               <FiPackage size={20} />
             </div>
           </div>
           <Link href="/admin/requests" className="text-xs font-medium text-rose-600 hover:text-rose-700 mt-4 flex items-center gap-1 transition-colors">
             متابعة الطلبات الآن <FiArrowUpRight size={14} />
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Financial Transactions List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
             <h3 className="text-lg font-bold text-slate-900">أحدث المعاملات</h3>
             <Link href="/admin/finance" className="text-sm font-medium text-primary hover:text-orange-600 transition-colors">عرض الكل</Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6 text-xs justify-start font-semibold text-slate-500">المعاملة</th>
                  <th className="py-3 px-6 text-xs text-start font-semibold text-slate-500">القيمة</th>
                  <th className="py-3 px-6 text-xs font-semibold text-slate-500 hidden sm:table-cell text-start">المستخدم</th>
                  <th className="py-3 px-6 text-xs font-semibold text-slate-500 text-center">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {txLoading ? (
                  <tr><td colSpan={4} className="py-12 text-center text-slate-400 text-sm font-medium">جاري تحديث السجل...</td></tr>
                ) : !txs || txs.length === 0 ? (
                  <tr><td colSpan={4} className="py-12 text-center text-slate-400 text-sm font-medium">لا توجد معاملات بعد</td></tr>
                ) : (txs.slice(0, 5).map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                       <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                            tx.type.includes('COMMISSION') ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            <FiCreditCard size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 text-left" dir="ltr">{tx.type.replace('_', ' ')}</p>
                            <p className="text-[10px] text-slate-500 font-medium">#{tx.id}</p>
                          </div>
                       </div>
                    </td>
                    <td className="py-4 px-6">
                       <p className="text-sm font-bold text-slate-900 text-left" dir="ltr">{formatCurrency(tx.amount)}</p>
                    </td>
                    <td className="py-4 px-6 hidden sm:table-cell">
                       <p className="text-sm font-medium text-slate-700">{tx.user?.fullName || '---'}</p>
                    </td>
                    <td className="py-4 px-6 text-center">
                       <p className="text-[11px] font-medium text-slate-500">{formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true, locale: ar })}</p>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
             <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                سجل النشاط 
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
             </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[400px]">
             <LiveActivityList />
          </div>
          
          <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
             <div className="flex gap-2">
                <Link href="/admin/settings" className="flex-1 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-200/50 transition-colors">
                  <FiSettings size={14} /> الإعدادات
                </Link>
                <div className="w-px bg-slate-200 my-1"></div>
                <Link href="/admin/users" className="flex-1 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-200/50 transition-colors">
                  <FiShield size={14} /> التراخيص
                </Link>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function LiveActivityList() {
  const { data, loading } = useAsyncData<any[]>(() => apiFetch("/api/notifications?limit=10", "ADMIN"), []);

  if (loading) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-primary rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-medium text-slate-400">جاري تحميل السجل...</p>
      </div>
    );
  }
  
  if (!data || data.length === 0) {
    return <div className="p-12 text-center text-sm font-medium text-slate-500">لا يوجد نشاط مسجل حالياً</div>;
  }

  return (
    <div className="divide-y divide-slate-100">
      {data.map((item: any) => (
        <div key={item.id} className="p-4 hover:bg-slate-50/50 transition-colors flex gap-3">
           <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-500 mt-0.5">
             <FiActivity size={14} />
           </div>
           <div className="flex-1 min-w-0">
             <div className="flex justify-between items-start gap-2 mb-1">
                <h4 className="text-sm font-bold text-slate-800 truncate">{item.title}</h4>
                <span className="text-[10px] text-slate-400 font-medium shrink-0 whitespace-nowrap">
                  {formatDistanceToNow(new Date(item.createdAt), { locale: ar })}
                </span>
             </div>
             <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">{item.message}</p>
           </div>
        </div>
      ))}
    </div>
  );
}

export default AdminDashboard;
