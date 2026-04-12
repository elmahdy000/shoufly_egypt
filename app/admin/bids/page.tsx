"use client";

import Link from "next/link";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { listPendingAdminRequests } from "@/lib/api/requests";
import { StatusBadge } from "@/components/shoofly/status-badge";
import { FiInbox, FiArrowLeft, FiAlertCircle, FiActivity, FiBox, FiCpu } from "react-icons/fi";

export default function AdminBidsPage() {
  const { data, loading, error } = useAsyncData(() => listPendingAdminRequests(), []);

  return (
    <div className="p-8 lg:p-12 max-w-[1600px] mx-auto space-y-8 text-right dir-rtl font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">مركز العروض</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">فرز ومقارنة عروض التجار الموجهة للعملاء.</p>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <FiAlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
        <p className="text-sm text-amber-800">
          لا يمكن اعتماد العروض لحظياً من الفهرس العام. يجب الدخول إلى <strong>ملف الطلب الشامل</strong> لإجراء مقارنة دقيقة.
        </p>
      </div>

      {/* Bids Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
               <th className="py-3 px-6 text-xs font-semibold text-slate-500 text-right">الطلب</th>
               <th className="py-3 px-6 text-xs font-semibold text-slate-500 text-right">الحالة</th>
               <th className="py-3 px-6 text-xs font-semibold text-slate-500 text-left">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={3} className="py-12 text-center text-slate-400 text-sm font-medium">جاري تحميل العروض...</td></tr>
            ) : error ? (
              <tr><td colSpan={3} className="py-12 text-center text-rose-500 text-sm font-medium">{error}</td></tr>
            ) : (data?.length ?? 0) === 0 ? (
              <tr><td colSpan={3} className="py-12 text-center text-slate-400 text-sm font-medium">لا توجد عروض نشطة</td></tr>
            ) : (data ?? []).map((request: any) => (
              <tr key={request.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                        <FiBox size={18} />
                     </div>
                     <div>
                        <p className="font-semibold text-slate-900">{request.title}</p>
                        <p className="text-xs text-slate-400">#{request.id}</p>
                     </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <StatusBadge status="active" label={request.status === 'BIDS_RECEIVED' ? 'بانتظار الفرز' : 'جاري تجميع العروض'} />
                </td>
                <td className="py-4 px-6 text-left">
                  <Link 
                    href={`/admin/requests/${request.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                  >
                    عرض <FiArrowLeft size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
