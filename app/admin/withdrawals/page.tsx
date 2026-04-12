"use client";

import { useMemo, useState } from "react";
import { StatCard } from "@/components/shoofly/stat-card";
import { Button } from "@/components/shoofly/button";
import { StatusBadge } from "@/components/shoofly/status-badge";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { listAdminWithdrawals, reviewAdminWithdrawal } from "@/lib/api/transactions";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { FiArrowUpCircle, FiCheck, FiX, FiFilter, FiSearch, FiShield, FiDollarSign } from "react-icons/fi";

export default function AdminWithdrawalsPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const { data, loading, error, setData } = useAsyncData(() => listAdminWithdrawals(), []);
  const [activeId, setActiveId] = useState<number | null>(null);

  const filteredRows = useMemo(() => {
    const all = data ?? [];
    if (statusFilter === "ALL") return all;
    return all.filter((row: any) => row.status === statusFilter);
  }, [data, statusFilter]);

  async function handleReview(id: number, action: "APPROVE" | "REJECT") {
    setActiveId(id);
    try {
      const result = await reviewAdminWithdrawal(id, action);
      setData((current: any) => (current ?? []).map((row: any) => (row.id === id ? result : row)));
    } catch (err) {
      console.error(err);
    } finally {
      setActiveId(null);
    }
  }

  return (
    <div className="p-8 lg:p-12 max-w-[1600px] mx-auto space-y-8 dir-rtl text-right font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">طلبات السحب</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">إدارة عمليات تحويل المستحقات المالية للموردين.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative group">
              <FiFilter className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-all" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pr-12 pl-6 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none w-48 focus:border-primary transition-all cursor-pointer"
              >
                <option value="ALL">جميع الطلبات</option>
                <option value="PENDING">بانتظار الموافقة</option>
                <option value="APPROVED">تم التحويل</option>
                <option value="REJECTED">مرفوضة</option>
              </select>
           </div>
           <Button variant="secondary" className="h-12 px-4 rounded-xl">
             <FiSearch size={18} />
           </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard 
          title="معلق للدفع" 
          value={loading ? '...' : formatCurrency(data?.filter((r: any) => r.status === 'PENDING').reduce((s: number, r: any) => s + Number(r.amount), 0) || 0)} 
          icon={<FiArrowUpCircle size={20} className="text-primary" />} 
          className="bg-white border border-slate-200 shadow-sm"
        />
        <StatCard 
          title="تم سداده" 
          value={loading ? '...' : formatCurrency(data?.filter((r: any) => r.status === 'APPROVED').reduce((s: number, r: any) => s + Number(r.amount), 0) || 0)} 
          icon={<FiCheck size={20} className="text-emerald-500" />} 
          className="bg-white border border-slate-200 shadow-sm"
        />
        <StatCard 
          title="إجمالي السيولة" 
          value={loading ? '...' : formatCurrency((data ?? []).reduce((sum: number, r: any) => sum + Number(r.amount || 0), 0))} 
          icon={<FiDollarSign size={20} className="text-slate-400" />} 
          className="bg-white border border-slate-200 shadow-sm"
        />
      </div>

      {/* Withdrawals Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500">المورد</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500">القيمة</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 text-center">التاريخ</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500">الحالة</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center text-slate-400 text-sm font-medium">جاري تحميل البيانات...</td></tr>
              ) : filteredRows.map((row: any) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm">
                        {row.vendor?.fullName?.[0] || 'V'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{row.vendor?.fullName || `مورد #${row.vendorId}`}</p>
                        <p className="text-xs text-slate-400">#{row.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-900">
                    {formatCurrency(row.amount)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <p className="text-xs text-slate-500">{formatDate(row.createdAt)}</p>
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge 
                      status={row.status === 'APPROVED' ? 'completed' : row.status === 'PENDING' ? 'pending' : 'cancelled'} 
                      label={row.status === 'APPROVED' ? 'مكتمل' : row.status === 'PENDING' ? 'قيد المراجعة' : 'مرفوض'} 
                    />
                  </td>
                  <td className="py-4 px-6 text-left">
                    {row.status === 'PENDING' ? (
                      <div className="flex items-center justify-end gap-2">
                         <Button 
                           className="h-9 px-4 rounded-lg bg-emerald-500 text-white text-xs font-medium"
                           onClick={() => handleReview(row.id, 'APPROVE')}
                           isLoading={activeId === row.id}
                         >
                           تأكيد
                         </Button>
                         <button 
                           className="h-9 w-9 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition-colors flex items-center justify-center"
                           onClick={() => handleReview(row.id, 'REJECT')}
                           disabled={activeId === row.id}
                         >
                           <FiX size={16} />
                         </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">لا يوجد إجراء</span>
                    )}
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
