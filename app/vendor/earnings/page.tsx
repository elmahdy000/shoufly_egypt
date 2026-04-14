"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ErrorState } from "@/components/shared/error-state";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { listVendorTransactions, requestVendorWithdrawal } from "@/lib/api/transactions";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { 
  FiArrowUpRight, 
  FiArrowDownLeft, 
  FiClock, 
  FiDownload, 
  FiShield,
  FiTrendingUp,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

export default function VendorEarningsPage() {
  const { data, loading, error } = useAsyncData(() => listVendorTransactions(), []);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [withdrawInput, setWithdrawInput] = useState("");
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const summary = useMemo(() => {
    const rows = data ?? [];
    const payout = rows.filter((r: any) => r.type === "VENDOR_PAYOUT" || r.type === "REFUND_TO_VENDOR").reduce((sum: number, r: any) => sum + Number(r.amount ?? 0), 0);
    const withdrawals = rows.filter((r: any) => r.type === "WITHDRAWAL").reduce((sum: number, r: any) => sum + Number(r.amount ?? 0), 0);
    
    return { 
      totalEarned: payout, 
      available: payout - withdrawals,
      totalWithdrawn: withdrawals
    };
  }, [data]);

  const handleWithdrawal = async () => {
    const amount = Number(withdrawInput);
    if (isNaN(amount) || amount <= 0 || amount > summary.available) {
      setMessage({ text: "الرجاء إدخال مبلغ صحيح وضمن حدود رصيدك المتاح", type: "error" });
      return;
    }
    try {
      setIsProcessing(true);
      await requestVendorWithdrawal(amount);
      setMessage({ text: `تم تقديم طلب سحب بقيمة ${formatCurrency(amount)}`, type: "success" });
      setWithdrawInput("");
      setIsWithdrawOpen(false);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "حدث خطأ أثناء معالجة السحب", type: "error" });
      setIsProcessing(false);
    }
  };

  return (
    <div className="font-sans dir-rtl text-right">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-4 space-y-4">
        {message && (
          <div className={`p-3 rounded-xl flex items-center gap-2 text-sm font-medium ${
            message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}>
            {message.type === "success" ? <FiCheckCircle size={16} /> : <FiAlertCircle size={16} />}
            {message.text}
          </div>
        )}
        {(loading || isProcessing) && (
          <div className="flex flex-col items-center justify-center py-16 text-[#767684]">
             <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
             <p className="text-sm font-medium">جاري تحميل البيانات...</p>
          </div>
        )}
        
        {error && <ErrorState message={error} />}

        {!(loading || isProcessing) && !error && (
          <>
            {/* Balance Card */}
            <div className="bg-white rounded-xl border border-[#E7E7E7] shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <FiShield size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-[#565959] font-medium">الرصيد المتاح</p>
                  <p className="text-2xl font-bold text-[#0F1111]">
                    {formatCurrency(summary.available)}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsWithdrawOpen(!isWithdrawOpen)} 
                className="w-full py-3 rounded-lg font-medium text-sm transition-all border flex items-center justify-center gap-2 bg-white border-[#E7E7E7] text-[#0F1111] hover:border-primary"
              >
                <FiArrowUpRight size={14} /> 
                {isWithdrawOpen ? 'إلغاء' : 'طلب سحب'}
              </button>

              {isWithdrawOpen && (
                <div className="mt-4 p-4 bg-slate-50 border border-[#E7E7E7] rounded-xl">
                  <p className="text-sm text-[#565959] mb-3">المبلغ (حد أقصى {summary.available} ج.م):</p>
                  <div className="flex gap-2">
                     <input 
                       type="number"
                       value={withdrawInput}
                       onChange={(e) => setWithdrawInput(e.target.value)}
                       placeholder="0.00"
                       className="flex-1 bg-white border border-[#E7E7E7] px-4 py-3 rounded-xl outline-none focus:border-primary font-bold text-center"
                       dir="ltr"
                     />
                     <button 
                       onClick={handleWithdrawal} 
                       className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 font-semibold rounded-xl transition-colors"
                     >
                       سحب
                     </button>
                  </div>
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg border border-[#E7E7E7] p-3 text-center">
                <div className="w-8 h-8 bg-amber-50 rounded-md flex items-center justify-center text-amber-600 mx-auto mb-1">
                  <FiTrendingUp size={16} />
                </div>
                <p className="text-[10px] text-[#565959] font-medium mb-0.5">إجمالي الأرباح</p>
                <p className="text-lg font-bold text-[#0F1111]">{formatCurrency(summary.totalEarned)}</p>
              </div>
              
              <div className="bg-white rounded-lg border border-[#E7E7E7] p-3 text-center">
                <div className="w-8 h-8 bg-rose-50 rounded-md flex items-center justify-center text-rose-600 mx-auto mb-1">
                  <FiArrowUpRight size={16} />
                </div>
                <p className="text-[10px] text-[#565959] font-medium mb-0.5">المسحوبات</p>
                <p className="text-lg font-bold text-[#0F1111]">{formatCurrency(summary.totalWithdrawn)}</p>
              </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0F1111]">سجل المعاملات</h3>
                <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 cursor-not-allowed">
                  <FiDownload size={12} /> تصدير (قريباً)
                </span>
              </div>

              {!data || data.length === 0 ? (
                <div className="bg-white rounded-xl border border-[#E7E7E7] shadow-sm p-8 text-center">
                   <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-400">
                     <FiClock size={20} />
                   </div>
                   <h3 className="text-sm font-semibold text-[#0F1111] mb-1">لا توجد معاملات</h3>
                   <p className="text-xs text-[#565959]">لم يتم إجراء أي عمليات بعد</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-[#E7E7E7] shadow-sm overflow-hidden divide-y divide-[#E7E7E7]">
                  {(data ?? []).map((tx: any) => {
                    const isEarned = tx.type === "VENDOR_PAYOUT" || tx.type === "REFUND_TO_VENDOR";
                    const Icon = isEarned ? FiArrowDownLeft : FiArrowUpRight;
                    
                    let txLabel = tx.type;
                    if (isEarned) txLabel = "أرباح";
                    else if (tx.type === "WITHDRAWAL") txLabel = "سحب";

                    return (
                      <div key={tx.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isEarned ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                            <Icon size={14} />
                          </div>
                          <div>
                            <p className="font-medium text-xs text-[#0F1111]">{txLabel}</p>
                            <p className="text-[10px] text-[#767684]">{formatDate(tx.createdAt)}</p>
                          </div>
                        </div>
                        <p className={`font-bold text-sm ${isEarned ? 'text-emerald-600' : 'text-[#0F1111]'}`}>
                          {isEarned ? '+' : '-'}{formatCurrency(tx.amount).replace(' ج.م', '')}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
