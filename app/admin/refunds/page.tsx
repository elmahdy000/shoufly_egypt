"use client";

import { FormEvent, useMemo, useState } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { refundAdminRequest } from "@/lib/api/transactions";
import { AlertTriangle, CheckCircle, XCircle, Search, RotateCcw, Package } from "lucide-react";

type AdminRequest = {
  id: number;
  title: string;
  status: string;
  client?: { fullName?: string | null } | null;
};

export default function AdminRefundsPage() {
  const [requestId, setRequestId] = useState("");
  const [reason, setReason]       = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage]     = useState<string | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState("");

  const { data: allRequests, loading } = useAsyncData<AdminRequest[]>(
    () => apiFetch("/api/admin/requests", "ADMIN"),
    []
  );

  const refundable = useMemo(() => {
    const list = (allRequests ?? []).filter(r => r.status === "ORDER_PAID_PENDING_DELIVERY");
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(r =>
      r.title?.toLowerCase().includes(q) ||
      String(r.id).includes(q) ||
      r.client?.fullName?.toLowerCase().includes(q)
    );
  }, [allRequests, search]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      const result = await refundAdminRequest(Number(requestId), reason || "استرداد يدوي من لوحة الإدارة");
      setMessage(`تم إصدار الاسترداد بنجاح للطلب #${result.request?.id ?? requestId}`);
      setRequestId("");
      setReason("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "فشلت عملية الاسترداد");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">رد الأموال</h1>
        <p className="text-sm text-gray-500 mt-1">إدارة وتسوية طلبات استرجاع المبالغ للعملاء</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Refund Form */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <RotateCcw size={16} className="text-orange-500" />
                إصدار استرداد جديد
              </h2>
            </div>
            <div className="p-5 space-y-4">
              {/* Warning */}
              <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  هذا الإجراء غير قابل للتراجع. سيتم إلغاء الطلب فوراً بعد معالجة الاسترداد.
                </p>
              </div>

              {/* Feedback Messages */}
              {message && (
                <div className="flex items-center gap-2 p-3.5 bg-green-50 border border-green-200 rounded-lg text-xs font-semibold text-green-700">
                  <CheckCircle size={14} />
                  {message}
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-700">
                  <XCircle size={14} />
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">رقم الطلب</label>
                  <input
                    type="number"
                    value={requestId}
                    onChange={e => setRequestId(e.target.value)}
                    placeholder="مثال: 1024"
                    required
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">سبب الاسترداد</label>
                  <textarea
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="اذكر سبب الاسترداد..."
                    rows={3}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !requestId}
                  className="w-full py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> جاري المعالجة...</>
                  ) : (
                    <><RotateCcw size={15} /> تأكيد الاسترداد</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Eligible Requests Table */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
              <h2 className="text-base font-semibold text-gray-900 whitespace-nowrap">
                الطلبات المؤهلة للاسترداد
                <span className="mr-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">{refundable.length}</span>
              </h2>
              <div className="relative w-full max-w-xs">
                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="بحث..."
                  className="w-full pr-9 pl-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">الطلب</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">العميل</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={4} className="px-4 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : !refundable.length ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                            <Package size={18} className="text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-500">لا توجد طلبات مؤهلة للاسترداد</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    refundable.map(req => (
                      <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-xs font-mono text-gray-400">#{req.id}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{req.title}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{req.client?.fullName ?? "—"}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setRequestId(String(req.id))}
                            className="px-3 py-1.5 text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                          >
                            اختيار
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
