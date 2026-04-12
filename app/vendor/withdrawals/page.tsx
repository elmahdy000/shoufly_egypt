"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/shoofly/button";
import { ErrorState } from "@/components/shared/error-state";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { listVendorWithdrawals, requestVendorWithdrawal } from "@/lib/api/transactions";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { 
  FiArrowLeft, 
  FiArrowUpRight,
  FiClock,
  FiCheckCircle,
  FiLoader,
  FiCreditCard
} from "react-icons/fi";

export default function VendorWithdrawalsPage() {
  const { data, loading, error, setData } = useAsyncData(() => listVendorWithdrawals(), []);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await requestVendorWithdrawal(Number(amount));
      setData((current) => [result, ...(current ?? [])]);
      setMessage("تم طلب السحب بنجاح");
      setAmount("");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "فشل في طلب السحب");
    } finally {
      setIsSubmitting(false);
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { label: 'تم التنفيذ', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600', icon: FiCheckCircle };
      case 'PENDING':
        return { label: 'قيد المراجعة', bgColor: 'bg-amber-50', textColor: 'text-amber-600', icon: FiClock };
      case 'PROCESSING':
        return { label: 'جاري المعالجة', bgColor: 'bg-primary/10', textColor: 'text-primary', icon: FiLoader };
      default:
        return { label: status, bgColor: 'bg-slate-50', textColor: 'text-slate-600', icon: FiClock };
    }
  };

  return (
    <div className="font-sans dir-rtl text-right">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-4 space-y-4">
        {/* Withdraw Form */}
        <form onSubmit={onSubmit} className="bg-white rounded-xl border border-[#E7E7E7] shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <FiCreditCard size={16} />
            </div>
            <div>
              <h2 className="font-semibold text-xs text-[#0F1111]">طلب سحب جديد</h2>
              <p className="text-[10px] text-[#565959]">أدخل المبلغ</p>
            </div>
          </div>

          <div className="relative mb-3">
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-slate-50 border border-[#E7E7E7] px-3 py-3 rounded-lg outline-none focus:border-primary text-lg font-bold text-center transition-all"
              dir="ltr"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#767684] font-medium text-xs">ج.م</span>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            isLoading={isSubmitting}
          >
            {isSubmitting ? 'جاري التقديم...' : 'تقديم طلب سحب'}
          </Button>

          {message && (
            <div className={`mt-3 p-2.5 rounded-lg text-xs font-medium text-center ${
              message.includes('نجاح') 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {message}
            </div>
          )}
        </form>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-[#767684]">
             <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
             <p className="text-sm font-medium">جاري تحميل السجلات...</p>
          </div>
        )}

        {error && <ErrorState message={error} />}

        {!loading && !error && (data?.length ?? 0) === 0 ? (
          <div className="bg-white rounded-xl border border-[#E7E7E7] shadow-sm p-8 text-center">
             <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-400">
              <FiArrowUpRight size={20} />
            </div>
             <h3 className="text-sm font-semibold text-[#0F1111] mb-1">لا توجد طلبات</h3>
             <p className="text-xs text-[#565959]">ستظهر السحوبات هنا</p>
          </div>
        ) : null}

        {/* Withdrawals List */}
        {!loading && !error && (data?.length ?? 0) > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#0F1111]">سجل السحوبات</h3>
            <div className="grid gap-2">
              {(data ?? []).map((entry) => {
                const statusConfig = getStatusConfig(entry.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <div 
                    key={entry.id} 
                    className="bg-white rounded-lg border border-[#E7E7E7] shadow-sm p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                          <StatusIcon size={14} />
                        </div>
                        <div>
                          <p className="font-medium text-xs text-[#0F1111]">
                            {formatCurrency(entry.amount).split(' ')[0]} ج.م
                          </p>
                          <p className="text-[10px] text-[#767684]">{formatDate(entry.createdAt)}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                        {statusConfig.label}
                      </span>
                    </div>
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
