"use client";

import { useMemo, useState } from "react";
import { FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/shoofly/button";
import { ErrorState } from "@/components/shared/error-state";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { listVendorWithdrawals, requestVendorWithdrawal } from "@/lib/api/transactions";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import {
  FiArrowUpRight,
  FiClock,
  FiCheckCircle,
  FiLoader,
  FiCreditCard,
  FiInbox,
} from "react-icons/fi";

export default function VendorWithdrawalsPage() {
  const { data, loading, error, setData } = useAsyncData(() => listVendorWithdrawals(), []);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setMessage({ text: "الرجاء إدخال مبلغ صحيح", type: "error" });
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await requestVendorWithdrawal(numAmount);
      setData((current) => [result, ...(current ?? [])]);
      setMessage({ text: `تم طلب السحب بقيمة ${formatCurrency(numAmount)} بنجاح`, type: "success" });
      setAmount("");
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "فشل في طلب السحب", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return { label: "تم التنفيذ", bg: "bg-emerald-50", text: "text-emerald-700", icon: FiCheckCircle };
      case "PENDING":
        return { label: "قيد المراجعة", bg: "bg-amber-50", text: "text-amber-700", icon: FiClock };
      case "PROCESSING":
        return { label: "جاري المعالجة", bg: "bg-primary/10", text: "text-primary", icon: FiLoader };
      default:
        return { label: status, bg: "bg-slate-50", text: "text-slate-600", icon: FiClock };
    }
  };

  return (
    <div className="font-sans text-right" dir="rtl">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-4 space-y-4">

        {/* Page header */}
        <div className="mb-1">
          <h1 className="text-lg font-bold text-slate-900">السحوبات</h1>
          <p className="text-sm text-slate-500">إدارة وطلب سحب أرباحك</p>
        </div>

        {/* Feedback message */}
        {message && (
          <div className={`p-3 rounded-xl flex items-center gap-2 text-sm font-medium border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}>
            {message.type === "success" ? <FiCheckCircle size={16} /> : <FiArrowUpRight size={16} />}
            {message.text}
          </div>
        )}

        {/* Withdraw Form */}
        <form onSubmit={onSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <FiCreditCard size={18} />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900">طلب سحب جديد</h2>
              <p className="text-xs text-slate-500">أدخل المبلغ المراد سحبه</p>
            </div>
          </div>

          <div className="relative mb-4">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 rounded-xl outline-none focus:border-primary text-xl font-bold text-center transition-all text-slate-900 placeholder:text-slate-300"
              dir="ltr"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">ج.م</span>
          </div>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            {isSubmitting ? "جاري التقديم..." : "تقديم طلب السحب"}
          </Button>
        </form>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
            <p className="text-sm font-medium">جاري تحميل السجلات...</p>
          </div>
        )}

        {error && <ErrorState message={error} />}

        {/* Empty */}
        {!loading && !error && (data?.length ?? 0) === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-400">
              <FiInbox size={22} />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1">لا توجد طلبات سحب</h3>
            <p className="text-xs text-slate-500">ستظهر طلبات السحب هنا بعد تقديمها</p>
          </div>
        )}

        {/* Withdrawals List */}
        {!loading && !error && (data?.length ?? 0) > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">سجل السحوبات</h3>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
              {(data ?? []).map((entry) => {
                const cfg = getStatusConfig(entry.status);
                const StatusIcon = cfg.icon;

                return (
                  <div key={entry.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cfg.bg} ${cfg.text}`}>
                        <StatusIcon size={16} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-900">
                          {formatCurrency(entry.amount)}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">{formatDate(entry.createdAt)}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
