"use client";

import { FormEvent, useState } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { refundAdminRequest } from "@/lib/api/transactions";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  FiRefreshCw, FiAlertTriangle, FiFileText, FiHash,
  FiCheckCircle, FiXCircle, FiLoader, FiSearch, FiPackage
} from "react-icons/fi";

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  DELIVERED:  { label: "مُسلَّم",       color: "text-emerald-700", bg: "bg-emerald-50" },
  REJECTED:   { label: "مرفوض",        color: "text-rose-700",    bg: "bg-rose-50"    },
  REFUNDED:   { label: "مُسترَد مسبقاً", color: "text-slate-600",  bg: "bg-slate-100"  },
  IN_TRANSIT: { label: "قيد التوصيل",  color: "text-indigo-700",  bg: "bg-indigo-50"  },
};

export default function AdminRefundsPage() {
  const [requestId, setRequestId] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data: allRequests, loading: loadingReq } = useAsyncData<any[]>(
    () => apiFetch("/api/admin/requests", "ADMIN"), []
  );

  const refundable = (allRequests ?? []).filter((r: any) =>
    ["DELIVERED", "REJECTED", "IN_TRANSIT"].includes(r.status) &&
    r.status !== "REFUNDED"
  ).filter((r: any) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return r.title?.toLowerCase().includes(q) || String(r.id).includes(q) || r.client?.fullName?.toLowerCase().includes(q);
  });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      const result = await refundAdminRequest(Number(requestId), reason || "Delivery failed");
      setMessage(`تم إصدار المسترد بنجاح للطلب رقم #${result.request?.id ?? requestId}`);
      setRequestId("");
      setReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل إصدار المسترد");
    } finally {
      setIsLoading(false);
    }
  }

  function fillForm(r: any) {
    setRequestId(String(r.id));
    setMessage(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-6 text-right max-w-5xl mx-auto" dir="rtl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">إصدار المستردات</h1>
        <p className="text-sm text-slate-400 mt-0.5">اختر طلباً من القائمة أدناه أو أدخل رقمه يدوياً</p>
      </div>

      {/* Manual Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600">
            <FiRefreshCw size={18} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">إصدار مسترد يدوي</h2>
            <p className="text-xs text-slate-400">يخصم المبلغ من محفظة التاجر ويعيده للعميل</p>
          </div>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-amber-800 text-sm">
          <FiAlertTriangle className="shrink-0 mt-0.5" size={16} />
          <p>هذا الإجراء غير قابل للتراجع. تأكد من صحة رقم الطلب قبل التأكيد.</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2">
            <FiXCircle size={15} />{error}
          </div>
        )}
        {message && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-2">
            <FiCheckCircle size={15} />{message}
          </div>
        )}

        <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <FiHash size={13} />رقم الطلب
            </label>
            <input
              type="number"
              value={requestId}
              onChange={(e) => setRequestId(e.target.value)}
              placeholder="مثال: 9012"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold outline-none focus:border-primary focus:bg-white transition-all"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <FiFileText size={13} />سبب الاسترداد
            </label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="تفاصيل سبب الاسترداد"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary focus:bg-white transition-all"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isLoading || !requestId}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? <FiLoader className="animate-spin" size={16} /> : <FiRefreshCw size={16} />}
              تأكيد وإصدار المسترد
            </button>
          </div>
        </form>
      </div>

      {/* Refundable Requests List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="font-bold text-slate-900">الطلبات القابلة للاسترداد</h2>
              <p className="text-xs text-slate-400 mt-0.5">اضغط "استرداد" لملء الرقم تلقائياً</p>
            </div>
            <div className="relative">
              <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث..."
                className="pr-8 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-primary w-48"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 text-xs font-semibold text-slate-400">الطلب</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-400 hidden sm:table-cell">العميل</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-400">الحالة</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-400 hidden md:table-cell">الميزانية</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-400"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loadingReq ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>{[0,1,2,3,4].map((j) => <td key={j} className="py-4 px-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : refundable.length === 0 ? (
                <tr><td colSpan={5} className="py-10 text-center text-slate-400">لا توجد طلبات قابلة للاسترداد</td></tr>
              ) : refundable.map((r: any) => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
                        <FiPackage size={14} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 leading-none line-clamp-1">{r.title}</p>
                        <p className="text-[11px] text-slate-400">#{r.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell text-sm text-slate-600">{r.client?.fullName ?? "—"}</td>
                  <td className="py-3 px-4">
                    {(() => {
                      const m = STATUS_META[r.status] ?? { label: r.status, color: "text-slate-600", bg: "bg-slate-100" };
                      return <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${m.bg} ${m.color}`}>{m.label}</span>;
                    })()}
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell font-bold text-slate-900 text-xs">
                    {r.budget ? formatCurrency(Number(r.budget)) : "—"}
                  </td>
                  <td className="py-3 px-4 text-left">
                    <button
                      onClick={() => fillForm(r)}
                      className="text-xs font-bold px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 rounded-lg transition-all"
                    >
                      استرداد
                    </button>
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
