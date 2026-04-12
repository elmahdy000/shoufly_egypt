"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/shoofly/button";
import { ErrorState } from "@/components/shared/error-state";
import { StatusBadge } from "@/components/shoofly/status-badge";
import { payClientRequest } from "@/lib/api/transactions";
import { getRequestDetails, cancelClientRequest } from "@/lib/api/requests";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { SuccessConfetti } from "@/components/shoofly/success-confetti";
import { 
  FiFileText, 
  FiMapPin, 
  FiBox, 
  FiCheckCircle, 
  FiAlignLeft, 
  FiTruck, 
  FiDollarSign, 
  FiXCircle, 
  FiMessageSquare, 
  FiStar, 
  FiDownload, 
  FiActivity,
  FiAlertCircle,
  FiZap,
  FiPhone,
  FiUser,
  FiArrowLeft,
  FiClock,
  FiCalendar,
  FiCreditCard,
  FiPackage,
  FiCheck,
  FiMap
} from "react-icons/fi";

function RequestDetailsContent({ requestId }: { requestId: number }) {
  const router = useRouter();
  const { data, loading, error, refresh } = useAsyncData(() => getRequestDetails(requestId), [requestId]);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Review System States
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  async function handlePay() {
    try {
      setIsPaying(true);
      setActionMessage(null);
      const result = await payClientRequest(requestId);
      if (result.redirectUrl) {
         window.location.href = result.redirectUrl;
         return;
      }
      setActionMessage(`تمت عملية السداد بنجاح! الرصيد المتبقي بمحفظتك: ${result.wallet?.balance} ج.م`);
      setTimeout(() => refresh(), 2000);
    } catch (err) {
      setActionMessage(`${err instanceof Error ? err.message : "حدث خطأ أثناء محاولة الدفع"}`);
    } finally {
      setIsPaying(false);
    }
  }

  async function handleCancel() {
    if (!confirm("هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟")) return;
    try {
      setIsCancelling(true);
      setActionMessage(null);
      await cancelClientRequest(requestId);
      setActionMessage("تم إلغاء الطلب بنجاح.");
      setTimeout(() => refresh(), 2000);
    } catch (err) {
      setActionMessage(`${err instanceof Error ? err.message : "حدث خطأ أثناء محاولة الإلغاء"}`);
    } finally {
      setIsCancelling(false);
    }
  }

  const handleSubmitReview = async () => {
    if (rating === 0) return;
    setSubmittingReview(true);
    try {
      await fetch('/api/client/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          rating,
          comment: reviewComment
        })
      });
      setShowReviewDialog(false);
      refresh();
    } catch (err) {
      alert("فشل إرسال التقييم. حاول مرة أخرى.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 text-slate-400 animate-pulse font-sans">
       <div className="w-16 h-16 border-4 border-slate-100 border-t-primary rounded-[2rem] animate-spin mb-6" />
       <p className="font-black text-xl">ثواني بنجيبلك بيانات الأوردر...</p>
    </div>
  );
  if (error) return <ErrorState message={error} />;
  if (!data) return <ErrorState message="الأوردر ده مش موجود أو اتمسح." />;

  const isCompleted = data.status === 'CLOSED_SUCCESS';
  const hasOffers = data.status === 'OFFERS_FORWARDED' && data.selectedBidId === null;
  const isAwaitingPayment = data.status === 'OFFERS_FORWARDED' && data.selectedBidId !== null;
  const isPaid = data.status === 'ORDER_PAID_PENDING_DELIVERY';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 pb-32 text-right dir-rtl">
      {isCompleted && <SuccessConfetti />}
      
      {/* Header */}
      <div className="bg-white border-b border-slate-200/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Link 
                href="/client/requests" 
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
              >
                <FiArrowLeft size={20} />
              </Link>
              <div className="h-8 w-px bg-slate-200 mx-1" />
              <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">الطلبات</span>
            </div>

            <div className="flex items-center gap-3">
              {(!isPaid && !isCompleted && data.status !== 'CLOSED_CANCELLED') && (
                <Button 
                  variant="ghost" 
                  onClick={handleCancel}
                  isLoading={isCancelling}
                  className="text-rose-600 hover:bg-rose-50 font-bold text-sm rounded-xl"
                >
                  <FiXCircle className="ml-2" /> إلغاء
                </Button>
              )}
              <Link 
                href="/messages?otherId=1"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-slate-900/10 px-4 h-10 transition-all active:scale-95"
              >
                <FiMessageSquare size={18} /> الدعم الفني
              </Link>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                <FiPackage size={12} />
                REQ-{data.id}
              </span>
              <StatusBadge 
                status={isCompleted ? 'completed' : isPaid ? 'active' : isAwaitingPayment ? 'pending' : 'active'} 
                label={
                  isCompleted ? 'مكتمل بنجاح' :
                  isPaid ? 'جاري التنفيذ' :
                  isAwaitingPayment ? 'بانتظار الدفع' :
                  hasOffers ? 'لديك عروض جديدة' :
                  'قيد المراجعة'
                } 
              />
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight tracking-tight">
               {data.title || 'طلب خدمة شوفلي'}
            </h1>
            <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
              <FiCalendar size={14} className="text-slate-400" />
              تم الإنشاء: {data.createdAt ? new Date(data.createdAt).toLocaleDateString('ar-EG', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : '---'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-6 space-y-6">
      {actionMessage && (
        <div className={`p-4 rounded-2xl animate-in slide-in-from-top-4 flex items-center gap-3 font-medium text-sm ${
          actionMessage.includes('نجاح') || actionMessage.includes('تم') 
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            : 'bg-amber-50 border border-amber-200 text-amber-800'
        }`}>
          <FiAlertCircle className="shrink-0" size={20} />
          {actionMessage}
        </div>
      )}

      {/* Tracking Timeline Section (Only if Paid) */}
      {isPaid && (data as any).deliveryTracking?.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-3">
           <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm">
                 <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                       <FiActivity size={20} />
                    </div>
                    <div>
                       <h3 className="text-lg font-bold text-slate-900">رحلة الطلب</h3>
                       <p className="text-xs text-slate-500">تابع حالة طلبك لحظة بلحظة</p>
                    </div>
                 </div>
                 <div className="space-y-8 relative before:absolute before:right-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-primary before:to-slate-200">
                    {(data as any).deliveryTracking.map((step: any, idx: number) => (
                      <div key={idx} className="relative pr-14 group">
                         <div className={`absolute right-0 top-0 w-10 h-10 rounded-xl border-4 border-white flex items-center justify-center z-10 transition-all shadow-sm ${idx === 0 ? 'bg-primary text-white scale-110 shadow-primary/20' : 'bg-slate-100 text-slate-400'}`}>
                            {idx === 0 ? <FiZap size={18} /> : <div className="w-2 h-2 bg-current rounded-full" />}
                         </div>
                         <div className="space-y-1">
                            <p className={`font-bold ${idx === 0 ? 'text-slate-900 text-base' : 'text-slate-500'}`}>
                               {step.status === 'VENDOR_PREPARING' ? 'المورد بيجهز طلبك دلوقتي' : 
                                step.status === 'READY_FOR_PICKUP' ? 'الأوردر جاهز ومنتظر المندوب' :
                                step.status === 'OUT_FOR_DELIVERY' ? 'المندوب استلم الأوردر وفي الطريق لك' :
                                step.status === 'DELIVERED' ? 'تم التوصيل - بانتظار تأكيدك' : step.status}
                            </p>
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                               <FiClock size={12} />
                               {new Date(step.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Rider Card */}
           <div className="lg:col-span-1">
              {(data as any).deliveryAgent ? (
                <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-5 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
                   <div className="flex items-center gap-2 relative z-10">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">كابتن معتمد</span>
                   </div>
                   <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 relative z-10">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-orange-500 text-white flex items-center justify-center font-bold text-2xl shadow-lg">
                         {(data as any).deliveryAgent.fullName?.[0] || '?'}
                      </div>
                      <div>
                         <p className="font-bold text-lg">{(data as any).deliveryAgent.fullName}</p>
                         <p className="text-xs text-slate-400">مندوب التوصيل</p>
                      </div>
                   </div>
                   <Link href={`tel:${(data as any).deliveryAgent.phone}`} className="block">
                      <button className="w-full bg-primary hover:bg-orange-600 text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20">
                         <FiPhone size={18} /> اتصل بالكابتن
                      </button>
                   </Link>
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-3xl p-8 text-center space-y-4">
                   <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto text-slate-300 border border-slate-200 shadow-sm">
                      <FiUser size={28} />
                   </div>
                   <p className="text-sm font-medium text-slate-500">جاري البحث عن كابتن متاح...</p>
                </div>
              )}
           </div>
        </div>
      )}

      {isCompleted ? (
         <div className="grid gap-6 lg:grid-cols-2">
            {/* Completion Hero */}
            <div className="bg-white rounded-3xl p-8 lg:p-10 border border-slate-200 shadow-lg text-center space-y-6">
               <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                  <FiCheckCircle size={48} />
               </div>
               <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-slate-900">تمت المهمة بنجاح!</h2>
                  <p className="text-slate-500 font-medium">
                     تم الانتهاء من طلبك وتوصيله بنجاح
                  </p>
               </div>
               
               <div className="flex justify-center gap-6 py-4 border-y border-slate-100">
                  <div className="text-center">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">وقت التنفيذ</p>
                     <p className="text-lg font-bold text-slate-900 flex items-center gap-1">
                       <FiClock size={16} className="text-slate-400" />
                       {(data as any).completedAt && data.createdAt 
                         ? `${Math.round((new Date((data as any).completedAt).getTime() - new Date(data.createdAt).getTime()) / (1000 * 60 * 60))} ساعة`
                         : '---'}
                     </p>
                  </div>
                  <div className="text-center">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">التقييم</p>
                     <div className="flex gap-1 text-amber-500 text-lg">
                        {(data as any).review ? (
                          <>
                            {[...Array(5)].map((_, i) => (
                              <FiStar key={i} fill={i < (data as any).review.rating ? 'currentColor' : 'none'} />
                            ))}
                          </>
                        ) : (
                          <span className="text-sm text-slate-400">بانتظار التقييم</span>
                        )}
                     </div>
                  </div>
               </div>

               <div className="flex flex-col md:flex-row gap-4 pt-4">
                  <button className="flex-1 h-16 bg-slate-900 text-white rounded-2xl font-black text-base flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
                     <FiDownload size={20} /> تحميل الفاتورة (PDF)
                  </button>
                  <button 
                    onClick={() => !data.review && setShowReviewDialog(true)}
                    className={`flex-1 h-16 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all shadow-lg ${
                      data.review ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-100 cursor-default' : 'bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                     {data.review ? <><FiCheckCircle /> تم التقييم</> : 'تقييم التجربة الآن'}
                  </button>
               </div>

               {showReviewDialog && (
                 <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300 border-x-4 border-b-4 border-slate-900">
                       <div className="text-center space-y-2" dir="rtl">
                          <h3 className="text-3xl font-black text-slate-900 italic">إيه رأيك في الخدمة؟</h3>
                          <p className="text-slate-500 font-bold">تقييمك بيساعدنا نحسن جودة الموردين</p>
                       </div>
                       
                       <div className="flex justify-center gap-2" dir="ltr">
                          {[1, 2, 3, 4, 5].map((star) => (
                             <button 
                                key={star}
                                onClick={() => setRating(star)}
                                className={`text-5xl transition-all active:scale-90 ${rating >= star ? 'text-amber-400' : 'text-slate-200'}`}
                             >
                                <FiStar fill={rating >= star ? 'currentColor' : 'none'} />
                             </button>
                          ))}
                       </div>

                       <textarea 
                          dir="rtl"
                          placeholder="اكتب كلمة شكر أو ملاحظة للمورد..."
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 h-32 outline-none focus:border-primary font-medium text-sm transition-all text-right"
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                       />

                       <div className="flex gap-4" dir="rtl">
                          <Button 
                             onClick={handleSubmitReview}
                             isLoading={submittingReview}
                             disabled={rating === 0}
                             className="flex-1 h-16 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl"
                          >
                             إرسال التقييم
                          </Button>
                          <button 
                            onClick={() => setShowReviewDialog(false)}
                            className="bg-slate-100 text-slate-500 px-6 rounded-2xl font-black text-xs uppercase tracking-widest"
                          >
                            تراجع
                          </button>
                       </div>
                    </div>
                 </div>
               )}
            </div>

            <div className="space-y-6">
               <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <FiFileText className="text-primary" /> ملخص الفاتورة البريميوم
               </h4>
               <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white space-y-4 shadow-xl">
                  <div className="flex justify-between text-base font-bold text-slate-400">
                     <span>سعر الخدمة (متفق عليه)</span>
                     <span className="font-jakarta text-white">{data.selectedBid?.netPrice ? `${data.selectedBid.netPrice.toFixed(2)} ج.م` : '---'}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-slate-400">
                     <span>رسوم التوصيل والمنصة</span>
                     <span className="font-jakarta text-emerald-400">+ {data.selectedBid?.netPrice ? (data.selectedBid.netPrice * 0.15).toFixed(2) : '---'} ج.م</span>
                  </div>
                  <div className="h-px bg-white/10 my-4" />
                  <div className="flex justify-between text-3xl font-black">
                     <span className="text-primary italic">الإجمالي</span>
                     <span className="font-jakarta text-white">{data.selectedBid?.netPrice ? `${(data.selectedBid.netPrice * 1.15).toFixed(2)} ج.م` : '---'}</span>
                  </div>
               </div>
            </div>
         </div>
      ) : (
        <div className="space-y-10">
          {/* Action Zone - Context Aware */}
          {(hasOffers || isAwaitingPayment || isPaid) && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 lg:p-8 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <FiAlertCircle size={24} />
                    <h3 className="font-bold text-xl">محتاجين ردك هنا!</h3>
                  </div>
                  <p className="text-slate-300 text-base leading-relaxed max-w-xl">
                    {hasOffers && 'التجار بعتوا عروض أسعار منافسة جداً! افتح دلوقتي واختار أحسن عرض.'}
                    {isAwaitingPayment && 'مبروك، اخترت عرض ممتاز! ادفع دلوقتي علشان نأكد الحجز.'}
                    {isPaid && 'تم السداد بنجاح! إحنا بننسق مع المندوب علشان يوصلك الأوردر.'}
                  </p>
                </div>
                <div className="shrink-0">
                  {hasOffers && (
                    <Link href={`/client/offers/request/${requestId}`}>
                      <button className="font-bold text-base px-8 h-12 bg-primary hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2">
                        <FiBox size={18} /> عرض العروض
                      </button>
                    </Link>
                  )}
                  {isAwaitingPayment && (
                    <button 
                      onClick={handlePay} 
                      disabled={isPaying}
                      className="font-bold text-base px-8 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      <FiCreditCard size={18} /> تأكيد الدفع
                    </button>
                  )}
                  {isPaid && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link href={`/client/delivery/${requestId}`}>
                        <button className="font-bold text-sm px-6 h-11 bg-white text-slate-900 rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-2">
                          <FiMap size={16} /> تتبع المندوب
                        </button>
                      </Link>
                      <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/20 flex items-center gap-3">
                         <div>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-wider">كود الاستلام</p>
                            <p className="font-bold text-lg tracking-tight">SHF-{data.id % 10000}</p>
                         </div>
                         <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                            <FiPackage size={20} />
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
               <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <FiAlignLeft size={20} />
                    </div>
                    <div>
                       <h3 className="font-bold text-slate-900">تفاصيل الطلب</h3>
                       <p className="text-xs text-slate-500">وصف الطلب والمواصفات</p>
                    </div>
                  </div>
                  <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-2xl">
                    {data.description || 'لا يوجد وصف'}
                  </p>

                  {/* Image Gallery */}
                  {data.images && data.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      {data.images.map((img: any, idx: number) => (
                        <div key={idx} className="aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm hover:border-primary transition-all cursor-zoom-in">
                          <img 
                            src={img.filePath} 
                            alt={img.fileName} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                          <FiDollarSign size={14} />
                          <p className="text-xs font-bold uppercase tracking-wider">الميزانية المتوقعة</p>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{data.budget || '---'} <span className="text-sm text-slate-500 font-medium">ج.م</span></p>
                     </div>
                     <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                          <FiMapPin size={14} />
                          <p className="text-xs font-bold uppercase tracking-wider">عنوان التوصيل</p>
                        </div>
                        <p className="text-base font-bold text-slate-900 truncate">{data.address || 'لم يتم تحديد عنوان'}</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                 <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                    <FiActivity size={18} className="text-primary" />
                    <h3 className="font-bold text-slate-900">تتبع التقدم</h3>
                 </div>
                 <div className="space-y-6 relative before:absolute before:right-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-slate-300 before:to-slate-200">
                    {[
                      { label: 'تم إنشاء الطلب', active: true, icon: <FiBox size={16} /> },
                      { label: 'بندورلك على عروض', active: data.status !== 'PENDING_ADMIN_REVISION' && data.status !== 'CLOSED_CANCELLED', icon: <FiMapPin size={16} />, current: data.status === 'OPEN_FOR_BIDDING' },
                      { label: 'التنفيذ والشحن', active: ['ORDER_PAID_PENDING_DELIVERY', 'CLOSED_SUCCESS'].includes(data.status), icon: <FiTruck size={16} /> },
                      { label: 'تم الاستلام', active: isCompleted, icon: <FiCheck size={16} /> },
                    ].map((s, i) => (
                      <div key={i} className="relative pr-11">
                         <div className={`absolute right-0 top-0 w-8 h-8 rounded-xl border-2 border-white shadow-sm z-10 flex items-center justify-center transition-all ${
                           s.current ? 'bg-primary text-white scale-110 shadow-primary/20' :
                           s.active ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-300'
                         }`}>
                           {s.icon}
                         </div>
                         <p className={`text-sm font-bold ${s.active ? 'text-slate-900' : 'text-slate-400'}`}>{s.label}</p>
                         {s.current && <p className="text-xs text-primary font-medium mt-0.5">يحدث الآن...</p>}
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

export default function RequestDetailsPage() {
  const params = useParams<{ requestId: string }>();
  const parsed = Number(params.requestId);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return <ErrorState message="معرف الطلب غير صالح." />;
  }

  return <RequestDetailsContent requestId={parsed} />;
}
