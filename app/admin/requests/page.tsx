"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { StatCard } from "@/components/shoofly/stat-card";
import { Button } from "@/components/shoofly/button";
import { StatusBadge } from "@/components/shoofly/status-badge";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { listPendingAdminRequests, reviewAdminRequest, dispatchAdminRequest } from "@/lib/api/requests";
import { FiEye, FiCheck, FiX, FiSend, FiSearch, FiFilter, FiArrowLeft, FiMoreHorizontal } from "react-icons/fi";

interface RequestStats {
  dispatchedToday: number;
  rejectedToday: number;
}

export default function AdminRequestsPage() {
  const { data, loading, error, setData } = useAsyncData(() => listPendingAdminRequests(), []);
  const { data: stats, loading: statsLoading, error: statsError } = useAsyncData<RequestStats>(() => apiFetch("/api/admin/requests/stats", "ADMIN"), []);
  const [activeActionId, setActiveActionId] = useState<number | null>(null);
  
  if (error || statsError) {
    console.error("Requests API Error:", { error, statsError });
  }
  
  // حساب الإحصائيات من البيانات المتاحة
  const todayStats = useMemo(() => {
    const today = new Date().toDateString();
    const allRequests = data ?? [];
    const dispatched = allRequests.filter((r: any) => 
      r.status === 'DISPATCHED' && new Date(r.updatedAt).toDateString() === today
    ).length;
    const rejected = allRequests.filter((r: any) => 
      r.status === 'REJECTED' && new Date(r.updatedAt).toDateString() === today
    ).length;
    return { dispatched, rejected };
  }, [data]);

  async function handleAction(id: number, type: 'approve' | 'reject' | 'dispatch') {
    setActiveActionId(id);
    try {
      if (type === 'dispatch') {
        await dispatchAdminRequest(id);
        // Maybe update UI to show it's dispatched
      } else {
        await reviewAdminRequest(id, type);
        setData((rows: any) => (rows ?? []).filter((item: any) => item.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActiveActionId(null);
    }
  }

  return (
    <div className="p-8 lg:p-12 max-w-[1600px] mx-auto space-y-8 font-sans dir-rtl text-right">
      {/* Error Display */}
      {(error || statsError) && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
          <p className="font-bold">خطأ في تحميل البيانات:</p>
          <p>{error || statsError}</p>
          <p className="mt-2 text-xs">تأكد من تسجيل الدخول كـ Admin</p>
        </div>
      )}
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">إدارة الطلبات</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">مراجعة وفرز طلبات العملاء قبل توجيهها للموردين.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative group">
             <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-all" />
             <input 
               type="text" 
               placeholder="ابحث برقم الطلب..." 
               className="pr-12 pl-6 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none w-64 focus:border-primary transition-all"
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
          title="بانتظار المراجعة" 
          value={loading ? '...' : (data?.length ?? 0)} 
          icon={<FiEye size={20} />} 
          className="bg-white border border-slate-200 shadow-sm"
        />
        <StatCard 
          title="تم توجيهها اليوم" 
          value={statsLoading ? '...' : (stats?.dispatchedToday ?? todayStats.dispatched)} 
          icon={<FiSend size={20} />} 
          className="bg-white border border-slate-200 shadow-sm"
        />
        <StatCard 
          title="مرفوضة" 
          value={statsLoading ? '...' : (stats?.rejectedToday ?? todayStats.rejected)} 
          icon={<FiX size={20} />} 
          className="bg-white border border-slate-200 shadow-sm"
        />
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500">تفاصيل الطلب</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500">صاحب الطلب</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500">الموقع</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500">الحالة</th>
                <th className="py-3 px-6 text-left text-xs font-semibold text-slate-500">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center text-slate-400 text-sm font-medium">جاري تحميل الطلبات...</td></tr>
              ) : (data ?? []).map((request: any) => (
                <tr key={request.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 text-xs font-bold">
                          #{request.id}
                       </div>
                       <div>
                         <Link href={`/admin/requests/${request.id}`} className="font-semibold text-slate-900 hover:text-primary transition-colors block">
                           {request.title}
                         </Link>
                         <p className="text-[10px] text-slate-400">{new Date(request.createdAt).toLocaleDateString('ar-EG')}</p>
                       </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                        {request.clientId?.[0] ?? 'U'}
                      </div>
                      <p className="text-sm text-slate-700">عميل #{request.clientId}</p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm text-slate-600">{request.address || 'غير محدد'}</p>
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status="pending" label="بانتظار الموافقة" />
                  </td>
                  <td className="py-4 px-6 text-left">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        className="h-9 w-9 bg-emerald-50 rounded-lg text-emerald-600 hover:bg-emerald-100 transition-colors flex items-center justify-center"
                        onClick={() => handleAction(request.id, 'approve')}
                        disabled={!!activeActionId}
                      >
                        <FiCheck size={18} />
                      </button>
                      <button 
                        className="h-9 w-9 bg-rose-50 rounded-lg text-rose-600 hover:bg-rose-100 transition-colors flex items-center justify-center"
                        onClick={() => handleAction(request.id, 'reject')}
                        disabled={!!activeActionId}
                      >
                        <FiX size={18} />
                      </button>
                      <Button 
                        className="h-12 px-6 rounded-xl bg-slate-900 text-white font-black text-xs border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] hover:shadow-none transition-all flex items-center gap-2"
                        onClick={() => handleAction(request.id, 'dispatch')}
                        disabled={!!activeActionId}
                      >
                        <FiSend size={14} /> تـوجـيـه
                      </Button>
                    </div>
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
