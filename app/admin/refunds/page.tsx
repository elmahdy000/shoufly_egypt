"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/shoofly/button";
import { ErrorState } from "@/components/shared/error-state";
import { refundAdminRequest } from "@/lib/api/transactions";
import { FiRefreshCw, FiAlertTriangle, FiFileText, FiHash } from "react-icons/fi";

export default function AdminRefundsPage() {
  const [requestId, setRequestId] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      setError(null);
      const result = await refundAdminRequest(Number(requestId), reason || "Delivery failed");
      setMessage(`تم إصدار المسترد بنجاح للطلب رقم ${result.request?.id ?? requestId}`);
      setRequestId("");
      setReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refund request failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-8 lg:p-12 max-w-2xl mx-auto space-y-6 text-right dir-rtl font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">إصدار مسترد</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">إعادة المبالغ المالية للعملاء في حالات النزاع.</p>
        </div>
      </div>

      {error ? <ErrorState message={error} /> : null}
      
      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-sm font-medium flex items-center gap-3">
          <FiRefreshCw className="animate-spin" />
          {message}
        </div>
      )}

      {/* Refund Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-amber-800 text-sm">
          <FiAlertTriangle className="shrink-0 mt-0.5" size={18} />
          <p>إصدار المسترد سيخصم المبلغ من محفظة المورد ويعيده للعميل. هذا الإجراء غير قابل للتراجع.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900 flex items-center gap-2">
              <FiHash size={16} /> رقم الطلب
            </label>
            <input 
              type="number" 
              value={requestId} 
              onChange={(e) => setRequestId(e.target.value)}
              placeholder="مثال: 9012"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-medium outline-none focus:border-primary focus:bg-white transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900 flex items-center gap-2">
              <FiFileText size={16} /> سبب الاسترداد
            </label>
            <textarea 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
              placeholder="اكتب تفاصيل سبب الاسترداد..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white transition-all resize-none"
              required
            />
          </div>

          <Button 
            type="submit" 
            isLoading={isLoading} 
            className="w-full h-12 text-base rounded-xl font-medium"
            variant="danger"
          >
            تأكيد وإصدار المسترد
          </Button>
        </form>
      </div>

      <p className="text-center text-xs text-slate-400 font-medium">
        سجل العمليات الإدارية محفوظ تلقائياً
      </p>
    </div>
  );
}
