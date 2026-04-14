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
  FiFileText, FiMapPin, FiCheckCircle, FiAlignLeft, FiTruck,
  FiDollarSign, FiXCircle, FiMessageSquare, FiStar, FiActivity,
  FiAlertCircle, FiZap, FiPhone, FiUser, FiArrowLeft, FiClock,
  FiCalendar, FiCreditCard, FiPackage, FiCheck, FiMap, FiBox,
  FiRefreshCw, FiX
} from "react-icons/fi";

const STATUS_LABEL: Record<string, string> = {
  PENDING_ADMIN_REVISION:       "قيد المراجعة",
  OPEN_FOR_BIDDING:             "مفتوح للعروض",
  OFFERS_FORWARDED:             "عروض متاحة",
  ORDER_PAID_PENDING_DELIVERY:  "جاري التنفيذ",
  CLOSED_SUCCESS:               "مكتمل",
  CLOSED_FAILED:                "فشل",
  CLOSED_CANCELLED:             "ملغي",
};

const JOURNEY = [
  { label: "إنشاء الطلب",      statuses: ["PENDING_ADMIN_REVISION", "OPEN_FOR_BIDDING", "OFFERS_FORWARDED", "ORDER_PAID_PENDING_DELIVERY", "CLOSED_SUCCESS"] },
  { label: "البحث عن عروض",    statuses: ["OPEN_FOR_BIDDING", "OFFERS_FORWARDED", "ORDER_PAID_PENDING_DELIVERY", "CLOSED_SUCCESS"] },
  { label: "الدفع والتأكيد",   statuses: ["ORDER_PAID_PENDING_DELIVERY", "CLOSED_SUCCESS"] },
  { label: "التسليم والإغلاق", statuses: ["CLOSED_SUCCESS"] },
];

function RequestDetailsContent({ requestId }: { requestId: number }) {
  const router = useRouter();
  const { data, loading, error, refresh } = useAsyncData(() => getRequestDetails(requestId), [requestId]);
  const [actionMsg, setActionMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  async function handlePay() {
    try {
      setIsPaying(true);
      setActionMsg(null);
      const result = await payClientRequest(requestId);
      if (result.redirectUrl) { window.location.href = result.redirectUrl; return; }
      setActionMsg({ type: "ok", text: `تمت عملية السداد بنجاح! الرصيد المتبقي: ${result.wallet?.balance} ج.م` });
      setTimeout(refresh, 2000);
    } catch (err) {
      setActionMsg({ type: "err", text: err instanceof Error ? err.message : "حدث خطأ أثناء الدفع" });
    } finally { setIsPaying(false); }
  }

  async function handleCancel() {
    if (!confirm("هل أنت متأكد من إلغاء هذا الطلب؟")) return;
    try {
      setIsCancelling(true);
      setActionMsg(null);
      await cancelClientRequest(requestId);
      setActionMsg({ type: "ok", text: "تم إلغاء الطلب بنجاح." });
      setTimeout(refresh, 2000);
    } catch (err) {
      setActionMsg({ type: "err", text: err instanceof Error ? err.message : "حدث خطأ" });
    } finally { setIsCancelling(false); }
  }

  async function handleReview() {
    if (rating === 0) return;
    setSubmittingReview(true);
    try {
      await fetch('/api/client/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, rating, comment: reviewComment }),
        credentials: 'include',
      });
      setShowReview(false);
      refresh();
    } catch {
      setActionMsg({ type: "err", text: "فشل إرسال التقييم. حاول مرة أخرى." });
    } finally { setSubmittingReview(false); }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-4">
      <FiRefreshCw size={28} className="animate-spin text-primary" />
      <p className="text-sm font-medium">جاري تحميل بيانات الطلب...</p>
    </div>
  );
  if (error) return <ErrorState message={error} />;
  if (!data) return <ErrorState message="الطلب غير موجود." />;

  const isCompleted   = data.status === "CLOSED_SUCCESS";
  const isCancelled   = data.status === "CLOSED_CANCELLED";
  const hasOffers     = data.status === "OFFERS_FORWARDED" && data.selectedBidId === null;
  const awaitPayment  = data.status === "OFFERS_FORWARDED" && data.selectedBidId !== null;
  const isPaid        = data.status === "ORDER_PAID_PENDING_DELIVERY";
  const canCancel     = !isPaid && !isCompleted && !isCancelled;
  const st            = STATUS_LABEL[data.status] ?? data.status;

  return (
    <div className="min-h-screen bg-slate-50 pb-32 text-right" dir="rtl">
      {isCompleted && <SuccessConfetti />}

      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link href="/client/requests" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
              <FiArrowLeft size={18} />
            </Link>
            <span className="text-xs font-semibold text-slate-500">طلب #{data.id}</span>
          </div>
          <div className="flex items-center gap-2">
            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex items-center gap-1.5 px-3 py-2 text-rose-600 text-xs font-semibold rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 transition-colors disabled:opacity-50"
              >
                {isCancelling ? <FiRefreshCw size={13} className="animate-spin" /> : <FiXCircle size={13} />} إلغاء
              </button>
            )}
            <Link
              href={`/client/chat`}
              className="flex items-center gap-1.5 px-3 py-2 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
            >
              <FiMessageSquare size={13} /> الدعم
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-5 space-y-4">

        {/* Action message */}
        {actionMsg && (
          <div className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-medium ${
            actionMsg.type === "ok"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-rose-50 border border-rose-200 text-rose-700"
          }`}>
            {actionMsg.type === "ok" ? <FiCheckCircle size={18} className="shrink-0" /> : <FiAlertCircle size={18} className="shrink-0" />}
            <span className="flex-1">{actionMsg.text}</span>
            <button onClick={() => setActionMsg(null)}><FiX size={16} className="opacity-50 hover:opacity-100" /></button>
          </div>
        )}

        {/* Title card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <FiPackage size={11} /> REQ-{data.id}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                isCompleted  ? "bg-emerald-50 text-emerald-700" :
                isCancelled  ? "bg-rose-50 text-rose-500" :
                isPaid       ? "bg-violet-50 text-violet-600" :
                hasOffers    ? "bg-amber-50 text-amber-600" :
                               "bg-slate-100 text-slate-600"
              }`}>{st}</span>
            </div>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2 leading-snug">{data.title || "طلب خدمة"}</h1>
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <FiCalendar size={12} />
            {data.createdAt ? new Date(data.createdAt).toLocaleDateString("ar-EG", { year:"numeric", month:"long", day:"numeric", hour:"2-digit", minute:"2-digit" }) : "—"}
          </p>
        </div>

        {/* ── Action Zone (context-aware) ────────────── */}
        {(hasOffers || awaitPayment) && (
          <div className={`rounded-2xl border p-5 space-y-3 ${
            awaitPayment ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
          }`}>
            <div className={`flex items-center gap-2 text-sm font-bold ${awaitPayment ? "text-emerald-800" : "text-amber-800"}`}>
              <FiAlertCircle size={16} />
              {hasOffers ? "لديك عروض جديدة من التجار!" : "الطلب جاهز للدفع"}
            </div>
            <p className={`text-xs leading-relaxed ${awaitPayment ? "text-emerald-700" : "text-amber-700"}`}>
              {hasOffers ? "راجع العروض المتاحة واختر الأنسب لك." : "اضغط تأكيد الدفع لإتمام الحجز وبدء التنفيذ."}
            </p>
            <div className="pt-1">
              {hasOffers && (
                <Link href={`/client/offers/request/${requestId}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 transition-colors">
                  <FiBox size={16} /> عرض العروض
                </Link>
              )}
              {awaitPayment && (
                <button
                  onClick={handlePay}
                  disabled={isPaying}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {isPaying ? <FiRefreshCw size={15} className="animate-spin" /> : <FiCreditCard size={15} />}
                  تأكيد الدفع
                </button>
              )}
            </div>
          </div>
        )}

        {isPaid && (
          <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-violet-800 text-sm font-bold">
              <FiTruck size={16} /> الطلب يُنفَّذ الآن
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-violet-700 mb-0.5">كود الاستلام</p>
                <p className="text-lg font-black text-violet-900 tracking-wider">SHF-{data.id % 10000}</p>
              </div>
              <Link href={`/client/delivery/${requestId}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors">
                <FiMap size={15} /> تتبع المندوب
              </Link>
            </div>
          </div>
        )}

        {/* ── Journey progress ────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <FiActivity size={16} className="text-primary" /> مسار الطلب
          </h3>
          <div className="flex items-center gap-0">
            {JOURNEY.map((step, idx) => {
              const done = step.statuses.includes(data.status);
              const current = JOURNEY[idx + 1] ? !JOURNEY[idx + 1].statuses.includes(data.status) && done : isCompleted;
              return (
                <div key={idx} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      isCompleted && idx === 3  ? "bg-emerald-500 border-emerald-500 text-white" :
                      current                   ? "bg-primary border-primary text-white" :
                      done                      ? "bg-slate-800 border-slate-800 text-white" :
                                                  "bg-white border-slate-200 text-slate-300"
                    }`}>
                      {done ? <FiCheck size={14} /> : idx + 1}
                    </div>
                    <span className={`text-[10px] text-center leading-tight font-medium ${done ? "text-slate-700" : "text-slate-400"}`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < 3 && (
                    <div className={`h-0.5 w-4 shrink-0 mb-5 ${done && JOURNEY[idx + 1]?.statuses.includes(data.status) ? "bg-slate-800" : "bg-slate-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Delivery tracking timeline ────────────── */}
        {isPaid && (data as any).deliveryTracking?.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <FiZap size={16} className="text-amber-500" /> تحديثات المندوب
            </h3>
            <div className="relative space-y-5 before:absolute before:right-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {(data as any).deliveryTracking.map((step: any, idx: number) => (
                <div key={idx} className="relative pr-12">
                  <div className={`absolute right-0 top-0 w-8 h-8 rounded-xl border-2 border-white flex items-center justify-center z-10 shadow-sm ${
                    idx === 0 ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                  }`}>
                    {idx === 0 ? <FiZap size={14} /> : <div className="w-2 h-2 bg-slate-300 rounded-full" />}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${idx === 0 ? "text-slate-900" : "text-slate-500"}`}>
                      {step.status === "VENDOR_PREPARING"  ? "المورد يجهّز طلبك" :
                       step.status === "READY_FOR_PICKUP"  ? "الطلب جاهز وينتظر المندوب" :
                       step.status === "OUT_FOR_DELIVERY"  ? "المندوب في الطريق إليك" :
                       step.status === "DELIVERED"         ? "تم التوصيل — انتظر تأكيدك" : step.status}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <FiClock size={11} />
                      {new Date(step.createdAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery agent card */}
            {(data as any).deliveryAgent && (
              <div className="mt-4 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-xl text-white flex items-center justify-center font-bold text-lg shrink-0">
                  {(data as any).deliveryAgent.fullName?.[0] ?? "؟"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm">{(data as any).deliveryAgent.fullName}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> كابتن معتمد
                  </p>
                </div>
                <a href={`tel:${(data as any).deliveryAgent.phone}`}
                  className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/90 transition-colors">
                  <FiPhone size={13} /> اتصال
                </a>
              </div>
            )}
          </div>
        )}

        {/* ── Completion card ───────────────────────── */}
        {isCompleted && (
          <div className="bg-white rounded-2xl border border-emerald-200 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                <FiCheckCircle size={24} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">اكتمل الطلب بنجاح</h2>
                <p className="text-xs text-slate-500">تم الانتهاء من جميع مراحل الطلب</p>
              </div>
            </div>

            {/* Invoice summary */}
            {data.selectedBid?.netPrice && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>سعر الخدمة</span>
                  <span className="font-semibold">{Number(data.selectedBid.netPrice).toFixed(2)} ج.م</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>رسوم المنصة</span>
                  <span className="font-semibold">+{(Number(data.selectedBid.netPrice) * 0.15).toFixed(2)} ج.م</span>
                </div>
                <div className="h-px bg-slate-200" />
                <div className="flex justify-between text-sm font-bold text-slate-900">
                  <span>الإجمالي</span>
                  <span className="text-primary">{(Number(data.selectedBid.netPrice) * 1.15).toFixed(2)} ج.م</span>
                </div>
              </div>
            )}

            {/* Rating */}
            {data.review ? (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <FiStar key={i} size={16} className="text-amber-500" fill={i <= (data as any).review.rating ? "currentColor" : "none"} />
                  ))}
                </div>
                <span className="text-xs text-amber-700 font-medium">تم تقييم الخدمة</span>
              </div>
            ) : (
              <button
                onClick={() => setShowReview(true)}
                className="w-full py-3 border-2 border-amber-200 text-amber-700 text-sm font-semibold rounded-xl hover:bg-amber-50 transition-colors flex items-center justify-center gap-2"
              >
                <FiStar size={16} /> قيّم تجربتك الآن
              </button>
            )}
          </div>
        )}

        {/* ── Request details card ─────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2 pb-3 border-b border-slate-100">
            <FiAlignLeft size={16} className="text-slate-500" /> تفاصيل الطلب
          </h3>

          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-xl p-4">
            {data.description || "لا يوجد وصف"}
          </p>

          {data.images && data.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {data.images.map((img: any, idx: number) => (
                <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-slate-200 cursor-zoom-in hover:border-primary transition-colors">
                  <img src={img.filePath} alt={img.fileName} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mb-1">
                <FiDollarSign size={12} /> الميزانية المتوقعة
              </p>
              <p className="text-lg font-bold text-slate-900">
                {data.budget ? `${data.budget} ج.م` : "—"}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mb-1">
                <FiMapPin size={12} /> عنوان التوصيل
              </p>
              <p className="text-sm font-semibold text-slate-900 leading-snug">
                {data.address || "لم يتم تحديد عنوان"}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* ── Review dialog ──────────────────────── */}
      {showReview && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40" dir="rtl">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">قيّم تجربتك</h3>
              <button onClick={() => setShowReview(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <FiX size={18} />
              </button>
            </div>

            <div className="flex justify-center gap-2" dir="ltr">
              {[1,2,3,4,5].map(star => (
                <button key={star} onClick={() => setRating(star)} className={`text-4xl transition-transform active:scale-90 ${rating >= star ? "text-amber-400" : "text-slate-200"}`}>
                  <FiStar fill={rating >= star ? "currentColor" : "none"} />
                </button>
              ))}
            </div>

            <textarea
              dir="rtl"
              placeholder="اكتب ملاحظتك أو شكراً للمورد..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 h-28 outline-none focus:border-primary text-sm resize-none"
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
            />

            <div className="flex gap-3">
              <button onClick={() => setShowReview(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">
                تراجع
              </button>
              <button
                onClick={handleReview}
                disabled={rating === 0 || submittingReview}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submittingReview ? <FiRefreshCw size={14} className="animate-spin" /> : <FiStar size={14} />}
                إرسال التقييم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RequestDetailsPage() {
  const params = useParams<{ requestId: string }>();
  const parsed = Number(params.requestId);
  if (!Number.isFinite(parsed) || parsed <= 0) return <ErrorState message="معرف الطلب غير صالح." />;
  return <RequestDetailsContent requestId={parsed} />;
}
