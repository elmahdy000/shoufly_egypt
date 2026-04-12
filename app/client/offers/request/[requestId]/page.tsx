"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/shoofly/button";
import { ErrorState } from "@/components/shared/error-state";
import { StatusBadge } from "@/components/shoofly/status-badge";
import { acceptClientOffer, listClientForwardedOffers } from "@/lib/api/bids";
import { formatCurrency } from "@/lib/formatters";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { FiTag, FiCheckCircle, FiShield, FiAlertTriangle, FiStar } from "react-icons/fi";

function OffersContent({ requestId }: { requestId: number }) {
  const router = useRouter();
  const { data, loading, error } = useAsyncData(() => listClientForwardedOffers(requestId), [requestId]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  async function accept(bidId: number) {
    try {
      setSubmittingId(bidId);
      setFeedback(null);
      await acceptClientOffer(bidId);
      setFeedback({ type: 'success', text: `تم اعتماد العرض رقم #${bidId} بنجاح! سيتم توجيهك لصفحة الدفع...` });
      
      // Auto-redirect to the request details to finalize payment
      setTimeout(() => {
        router.push(`/client/requests/${requestId}`);
      }, 2500);
      
    } catch (err) {
      setFeedback({ type: 'error', text: err instanceof Error ? err.message : "حدث خطأ أثناء محاولة اعتماد العرض." });
      setSubmittingId(null);
    }
  }

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8 pb-32 text-right">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <FiTag className="text-primary" /> العروض المتاحة
          </h1>
          <p className="text-muted text-sm mt-1">قارن بين الأسعار المطروحة لاختيار الأنسب لطلبك رقم REQ-{requestId}</p>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
          {feedback.type === 'success' ? <FiCheckCircle size={20} /> : <FiAlertTriangle size={20} />}
          {feedback.text}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-muted animate-pulse">
           <FiTag size={40} className="mb-4 opacity-30" />
           <p className="font-bold">جاري فتح المظاريف والعروض...</p>
        </div>
      )}

      {error ? <ErrorState message={error} /> : null}

      {!loading && !error && (data?.length ?? 0) === 0 ? (
        <div className="shoofly-card bg-slate-50/50 p-12 text-center flex flex-col items-center justify-center">
           <div className="w-16 h-16 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center mb-4">
             <FiTag size={24} />
           </div>
           <h3 className="text-xl font-bold mb-2">لا توجد عروض معتمدة بعد</h3>
           <p className="text-muted">لم تقم الإدارة بتوجيه أي عروض لطلبك حتى الآن. يرجى الانتظار لحين الانتهاء من فرز الأسعار.</p>
        </div>
      ) : null}

      <div className="grid gap-6">
        {(data ?? []).map((offer: any) => {
          const isAccepted = offer.status === 'ACCEPTED_BY_CLIENT';
          const isLoading = submittingId === offer.id;
          
          return (
            <div key={offer.id} className={`shoofly-card bg-white p-6 relative overflow-hidden group transition-all flex flex-col md:flex-row md:items-center gap-6 border-2 ${isAccepted ? 'border-emerald-500 shadow-emerald-500/10' : 'border-border hover:border-primary/30'}`}>
              
              {/* Price Tag */}
              <div className="w-full md:w-56 shrink-0 bg-slate-900 text-white p-6 rounded-2xl flex flex-col items-center justify-center shadow-lg">
                 <p className="text-xs text-slate-400 font-bold mb-2">التكلفة الإجمالية</p>
                 <p className="text-3xl font-black font-jakarta tracking-tight">
                   {formatCurrency(offer.clientPrice ?? offer.netPrice)}
                 </p>
                 <div className="mt-3 text-[10px] bg-slate-800 text-slate-300 px-3 py-1 rounded-full flex items-center gap-1">
                   <FiShield /> شامل الدعم والنقل
                 </div>
              </div>

              {/* Details & Action */}
              <div className="flex-1 flex flex-col gap-4">
                <div>
                   <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs border border-white shadow-sm">
                           V
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">مورّد شوفلي المعتمد # {offer.vendorId}</p>
                          <div className="flex gap-0.5 text-[10px] text-amber-500">
                             <FiStar fill="currentColor" /> <FiStar fill="currentColor" /> <FiStar fill="currentColor" /> <FiStar fill="currentColor" /> <FiStar fill="currentColor" />
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                        #{offer.id}
                      </span>
                  </div>
                  
                  {isAccepted && <div className="mb-4"><StatusBadge status="completed" label="تم الاعتماد" /></div>}
                  
                  <h3 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-2">تقديم المورد:</h3>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
                    {offer.description || 'لم يتم إدراج تفاصيل إضافية لهذا العرض.'}
                  </p>
                </div>
                
                {!isAccepted && (
                  <div className="flex justify-end pt-2">
                    <Button 
                      onClick={() => accept(offer.id)} 
                      isLoading={isLoading}
                      disabled={submittingId !== null && submittingId !== offer.id}
                      className="px-8 shadow-md"
                    >
                      قبول هذا العرض
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ClientOffersPage() {
  const params = useParams<{ requestId: string }>();
  const parsed = Number(params.requestId);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return <ErrorState message="معرف الطلب غير صحيح." />;
  }

  return <OffersContent requestId={parsed} />;
}
