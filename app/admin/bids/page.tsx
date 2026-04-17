"use client";

import Link from "next/link";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { listPendingAdminRequests } from "@/lib/api/requests";
import { Package, ChevronLeft, Gavel, AlertCircle, Clock } from "lucide-react";

interface Request {
  id: number;
  title: string;
  status: string;
  _count?: { bids: number };
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  OPEN_FOR_BIDDING:    { label: "مفتوح للعروض",    cls: "bg-green-50 text-green-700 border-green-200" },
  BIDS_RECEIVED:       { label: "وصلت عروض",        cls: "bg-blue-50 text-blue-700 border-blue-200" },
  OFFERS_FORWARDED:    { label: "تم إرسال العروض",   cls: "bg-orange-50 text-orange-700 border-orange-200" },
  PENDING_ADMIN_REVISION: { label: "قيد المراجعة",  cls: "bg-amber-50 text-amber-700 border-amber-200" },
};

export default function AdminBidsPage() {
  const { data, loading, error } = useAsyncData<Request[]>(() => listPendingAdminRequests(), []);

  const totalBids = data?.reduce((sum, r) => sum + (r._count?.bids || 0), 0) ?? 0;

  return (
    <div className="p-6 space-y-6" dir="rtl">

      {/* Page Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">إدارة العروض</h1>
        <p className="text-sm text-gray-500 mt-1">الطلبات النشطة التي تنتظر مراجعة العروض والاعتماد</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
            <Package size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">إجمالي الطلبات</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{data?.length ?? 0}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Gavel size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">إجمالي العروض</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{totalBids}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">تنتظر المراجعة</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">
              {data?.filter(r => r.status === "BIDS_RECEIVED").length ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Info Notice */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700">
          لإدارة أو اعتماد عرض معين، انتقل إلى صفحة تفاصيل الطلب مباشرة.
        </p>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">الطلب</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">عدد العروض</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">الحالة</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={4} className="px-4 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-red-600 text-sm font-medium">{error}</td>
                </tr>
              ) : !data?.length ? (
                <tr>
                  <td colSpan={4} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Gavel size={22} className="text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-500">لا توجد عروض قيد الانتظار</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((req) => {
                  const st = STATUS_MAP[req.status];
                  return (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                            <Package size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{req.title}</p>
                            <p className="text-xs text-gray-400">#{req.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-50 text-orange-700 text-sm font-bold border border-orange-200">
                          {req._count?.bids ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {st ? (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${st.cls}`}>
                            {st.label}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">{req.status}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-left">
                        <Link
                          href={`/admin/requests/${req.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
                        >
                          التفاصيل
                          <ChevronLeft size={13} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
