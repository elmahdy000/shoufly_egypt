"use client";

import Link from "next/link";
import { useState } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { listClientRequests } from "@/lib/api/requests";
import { Button } from "@/components/shoofly/button";
import {
  FiArrowRight, FiAlertCircle, FiCheckCircle, FiRefreshCw, FiFileText
} from "react-icons/fi";

export default function ComplaintsPage() {
  const { data: requests, loading: reqLoading } = useAsyncData(
    () => listClientRequests(), []
  );

  const [requestId, setRequestId] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!requestId || !subject.trim() || !description.trim()) return;

    try {
      setSubmitting(true);
      setResult(null);
      await apiFetch('/api/client/complaints', 'CLIENT', {
        method: 'POST',
        body: { requestId: Number(requestId), subject: subject.trim(), description: description.trim() },
      });
      setResult({ type: 'success', text: 'تم إرسال الشكوى بنجاح. سيتم مراجعتها من قِبل الإدارة.' });
      setRequestId('');
      setSubject('');
      setDescription('');
    } catch (err) {
      setResult({ type: 'error', text: err instanceof Error ? err.message : 'حدث خطأ أثناء الإرسال' });
    } finally {
      setSubmitting(false);
    }
  }

  const closedRequests = (requests ?? []).filter(
    (r: any) => ['CLOSED_SUCCESS', 'CLOSED_FAILED', 'OPEN_FOR_BIDDING', 'OFFERS_FORWARDED', 'PENDING_ADMIN_REVISION'].includes(r.status)
  );

  return (
    <div className="p-5 max-w-2xl mx-auto space-y-5 font-sans text-right pb-28" dir="rtl">

      {/* Header */}
      <div>
        <Link href="/client" className="text-sm text-slate-500 hover:text-primary flex items-center gap-1 mb-1">
          <FiArrowRight size={14} /> الرئيسية
        </Link>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FiAlertCircle className="text-rose-500" size={20} /> تقديم شكوى
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">أرسل شكوى لفريق الدعم بخصوص أحد طلباتك</p>
      </div>

      {/* Info box */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800 leading-relaxed">
        <p className="font-semibold mb-1 flex items-center gap-1.5"><FiFileText size={14} /> كيف تعمل الشكاوى؟</p>
        <p>بعد إرسال الشكوى سيراجعها فريق الدعم خلال 24 ساعة وسيتواصل معك لحل المشكلة.</p>
      </div>

      {/* Success / Error */}
      {result && (
        <div className={`flex items-start gap-3 p-4 rounded-2xl text-sm ${result.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-700'}`}>
          {result.type === 'success'
            ? <FiCheckCircle size={18} className="shrink-0 mt-0.5" />
            : <FiAlertCircle size={18} className="shrink-0 mt-0.5" />}
          <p>{result.text}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">

        {/* Request selector */}
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1.5">الطلب المرتبط بالشكوى *</label>
          {reqLoading ? (
            <div className="h-11 bg-slate-100 rounded-xl animate-pulse" />
          ) : (
            <select
              value={requestId}
              onChange={e => setRequestId(e.target.value)}
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors bg-white"
            >
              <option value="">— اختر الطلب —</option>
              {closedRequests.map((r: any) => (
                <option key={r.id} value={r.id}>
                  #{r.id} — {r.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Subject */}
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1.5">موضوع الشكوى *</label>
          <input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            required
            minLength={3}
            placeholder="مثال: لم يصل المندوب في الموعد"
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-slate-600 block mb-1.5">تفاصيل الشكوى *</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            minLength={10}
            rows={5}
            placeholder="اشرح المشكلة بالتفصيل حتى يتمكن الدعم من مساعدتك بشكل أفضل..."
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors resize-none leading-relaxed"
          />
          <p className="text-xs text-slate-400 mt-1">{description.length} حرف (الحد الأدنى 10)</p>
        </div>

        <button
          type="submit"
          disabled={submitting || !requestId || !subject.trim() || description.length < 10}
          className="w-full py-3 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? <FiRefreshCw size={15} className="animate-spin" /> : <FiAlertCircle size={15} />}
          إرسال الشكوى
        </button>
      </form>
    </div>
  );
}
