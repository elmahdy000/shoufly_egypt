"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/shoofly/button";
import { formatDate } from "@/lib/formatters";
import { StatusBadge } from "@/components/shoofly/status-badge";
import { forwardAdminBid, listAdminRequestBids } from "@/lib/api/bids";
import { getRequestDetails } from "@/lib/api/requests";
import { formatCurrency } from "@/lib/formatters";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { 
  FiClock, 
  FiMapPin, 
  FiUser, 
  FiArrowRight, 
  FiFileText, 
  FiActivity, 
  FiCheckCircle, 
  FiImage,
  FiMessageSquare,
  FiX,
  FiAlertTriangle,
  FiList
} from "react-icons/fi";
import { apiFetch } from "@/lib/api/client";

function AdminRequestDetails({ requestId }: { requestId: number }) {
  const router = useRouter();
  const request = useAsyncData(() => getRequestDetails(requestId), [requestId]);
  const bids = useAsyncData(() => listAdminRequestBids(requestId), [requestId]);
  const [activeActionId, setActiveActionId] = useState<number | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  async function handleForward(bidId: number) {
    setActiveActionId(bidId);
    try {
      await forwardAdminBid(bidId);
      bids.setData((rows: any) =>
        (rows ?? []).map((b: any) => ({ 
          ...b, 
          status: b.id === bidId ? "SELECTED" : (b.status === "SELECTED" ? "REJECTED" : b.status) 
        }))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActiveActionId(null);
    }
  }

  if (request.loading) {
    return (
      <div className="admin-page admin-page--detail" dir="rtl">
        <div className="p-10 text-center text-muted font-bold animate-pulse">بنجهز تفاصيل الطلب...</div>
      </div>
    );
  }
  if (request.error) {
    return (
      <div className="admin-page admin-page--detail" dir="rtl">
        <div className="shoofly-card border border-rose-200 bg-rose-50 p-6 sm:p-8 text-center space-y-4">
          <p className="text-rose-700 font-bold">{request.error}</p>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={request.refresh}>إعادة المحاولة</Button>
            <Button variant="secondary" onClick={() => router.push("/admin/requests")}>
              الرجوع للطلبات
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const req = request.data;
  if (!req) {
    return (
      <div className="admin-page admin-page--detail" dir="rtl">
        <div className="shoofly-card border border-slate-200 bg-white p-6 sm:p-8 text-center space-y-4">
          <p className="text-slate-700 font-bold">لا يمكن تحميل بيانات الطلب حاليًا.</p>
          <Button variant="secondary" onClick={() => router.push("/admin/requests")}>
            الرجوع للطلبات
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page admin-page--detail pb-20" dir="rtl">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="p-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl transition-all shadow-sm"
            >
              <FiArrowRight size={20} />
            </button>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 border-r-4 border-orange-500 pr-4">{req?.title}</h1>
            <StatusBadge status="active" label={req?.status ?? 'Pending'} />
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-500 pr-0 sm:pr-16 font-medium">
            <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-lg font-jakarta tracking-tight"><FiClock size={14}/> ID: {requestId}</span>
            <span className="flex items-center gap-1.5"><FiMapPin size={16} className="text-primary" /> {req?.address}</span>
            <span className="flex items-center gap-1.5"><FiMessageSquare size={16} /> التواصل مفعل</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href={`/messages?otherId=${req?.clientId}`}>
            <Button variant="secondary" className="gap-2 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 h-14 px-6 rounded-xl shadow-sm">
              <FiMessageSquare /> شات مع العميل
            </Button>
          </Link>
          <Button 
            onClick={() => setShowCancelConfirm(true)}
            className="h-14 px-6 rounded-xl shadow-sm border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 font-semibold"
          >
            إيقاف فوري للطلب
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Details & Bids */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info Card */}
          <div className="shoofly-card bg-white p-4 sm:p-8 lg:p-10 space-y-6 sm:space-y-10 border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
            
            <div className="space-y-6">
              <div className="flex items-center gap-2 font-bold text-2xl text-gray-900">
                <FiFileText className="text-primary" />
                <span>شرح المشكلة بالتفصيل</span>
              </div>
              <div className="text-gray-700 leading-relaxed bg-gray-50 p-6 rounded-xl border border-gray-200 text-sm font-medium">
                {req?.description || 'لا يوجد وصف تفصيلي لهذا الطلب.'}
              </div>
            </div>
            
            {/* Visual Evidence - Real Images */}
            <div className="space-y-6">
              <p className="text-xs font-semibold text-gray-500 tracking-wide flex items-center gap-2 border-b border-gray-100 pb-4">
                <FiImage /> المعاينة البصرية للموقع ({(req as any)?.images?.length || 0} صور)
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {(req as any)?.images && (req as any).images.length > 0 ? (
                  (req as any).images.map((img: any, idx: number) => (
                    <a
                      key={img.id}
                      href={img.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-square bg-gray-50 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-orange-400 transition-all group relative block"
                    >
                      <img
                        src={img.filePath}
                        alt={img.fileName || `صورة ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                        <FiImage size={32} />
                        <span className="text-xs mt-2 font-bold">صورة {idx + 1}</span>
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="col-span-full aspect-video bg-gray-50 rounded-xl flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200">
                    <FiImage size={40} />
                    <span className="text-sm mt-2 font-medium">لا توجد صور مرفقة بهذا الطلب</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bids Section */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <FiActivity className="text-primary" /> عروض الموردين المتاحة
              </h2>
              <span className="text-sm font-black px-4 py-2 bg-primary/10 text-primary rounded-2xl border border-primary/20">
                {bids.data?.length ?? 0} عرض مقدم
              </span>
            </div>

            <div className="space-y-6">
              {bids.loading ? (
                <div className="text-center py-20 opacity-50 font-bold animate-pulse">بنفرز عروض الأسعار...</div>
              ) : bids.error ? (
                <div className="shoofly-card p-8 text-center border border-rose-200 bg-rose-100 text-rose-700 font-bold">
                  {bids.error}
                </div>
              ) : (bids.data ?? []).length === 0 ? (
                <div className="shoofly-card p-12 text-center text-slate-400 font-bold border-dashed border-2">لسه مفيش عروض وصلت للطلب ده</div>
              ) : (bids.data ?? []).map((bid: any) => (
                <div key={bid.id} className="shoofly-card bg-white p-8 hover:border-primary/40 transition-all border-r-8 border-slate-100 group">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold text-xl border border-orange-600 shadow-sm">
                        {bid.vendor?.fullName?.[0] || 'V'}
                      </div>
                      <div>
                        <p className="font-black text-xl text-slate-900">{bid.vendor?.fullName || `المورد #${bid.vendorId}`}</p>
                        <div className="flex items-center gap-2 mt-1">
                           <StatusBadge status={bid.status === 'SELECTED' ? 'completed' : 'active'} label={bid.status} />
                           <span className="text-xs text-slate-400 font-bold font-jakarta">UID-{bid.vendorId}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left bg-emerald-100 p-4 rounded-2xl border border-emerald-200 shadow-sm w-full sm:min-w-[200px]">
                      <p className="text-xs text-emerald-700 font-bold tracking-wide mb-1 text-center">تكلفة العميل النهائية</p>
                      <p className="text-2xl font-bold font-jakarta text-emerald-700 text-center">
                        {formatCurrency(bid.clientPrice || 0)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 italic text-gray-600 font-medium leading-relaxed">
                    &quot;{bid.description || 'لا يوجد تفاصيل إضافية للعرض.'}&quot;
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 border-t border-slate-50 pt-6">
                    <Link href={`/messages?otherId=${bid.vendorId}`} className="w-full sm:w-auto">
                      <Button variant="secondary" className="w-full gap-2 h-12 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 font-semibold">
                        <FiMessageSquare /> شات مع المورد
                      </Button>
                    </Link>
                    <Button 
                      onClick={() => handleForward(bid.id)}
                      isLoading={activeActionId === bid.id}
                      className="w-full sm:flex-1 h-12 rounded-xl font-semibold shadow-sm tracking-wider"
                      variant={bid.status === 'SELECTED' ? 'secondary' : 'primary'}
                      disabled={bid.status === 'SELECTED'}
                    >
                      {bid.status === 'SELECTED' ? 'تم توجيهه للعميل بنجاح' : 'توجيه العرض للعميل فوراً'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Meta & Audit */}
        <div className="space-y-6">
          {/* Client Info Hub */}
          <div className="shoofly-card bg-white p-4 sm:p-8 space-y-6 relative overflow-hidden border border-gray-200">
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full blur-2xl" />
                <h3 className="font-semibold text-xs text-orange-600 tracking-wide relative z-10">بطاقة صاحب الطلب</h3>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 relative z-10 transition-all hover:bg-gray-50">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold text-2xl shadow-sm border border-orange-600">
                    <FiUser />
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-gray-900">{(req as any)?.clientName || `عميل #${req?.clientId}`}</p>
                    <p className="text-xs text-green-600 font-semibold tracking-tighter">حساب موثق</p>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-gray-100 text-sm">
                   <div className="flex justify-between font-medium">
                      <span className="text-gray-500">تاريخ إنشاء الطلب</span>
                      <span className="font-jakarta font-semibold text-gray-900">{req?.createdAt ? formatDate(req.createdAt) : '---'}</span>
                   </div>
                   <div className="flex justify-between font-medium">
                      <span className="text-gray-500">آخر تحديث</span>
                      <span className="font-jakarta font-semibold text-gray-900">{req?.updatedAt ? formatDate(req.updatedAt) : '---'}</span>
                   </div>
                   <div className="flex justify-between font-medium">
                      <span className="text-gray-500">معرف العميل</span>
                      <span className="font-jakarta font-semibold text-gray-900">#{req?.clientId}</span>
                   </div>
                </div>
          </div>

          {/* Audit Trail - Dynamic from API */}
          <div className="shoofly-card bg-white p-4 sm:p-8 space-y-8 border-2 border-slate-50">
            <h3 className="font-black text-xs text-slate-400 tracking-wide flex items-center gap-2 border-b border-slate-50 pb-4">
              <FiCheckCircle className="text-primary" /> التسلسل الزمني للأحداث
            </h3>
            
            <div className="space-y-10 relative before:absolute before:right-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
              {(req as any)?.deliveryTracking?.length > 0 ? (
                (req as any).deliveryTracking.map((track: any, i: number) => (
                  <div key={i} className="relative pr-12">
                     <div className={`absolute right-0 top-1 w-10 h-10 rounded-2xl border-4 border-white flex items-center justify-center z-10 transition-all bg-primary text-white shadow-sm scale-110`}>
                       <FiCheckCircle size={16} />
                     </div>
                     <div className="space-y-1">
                       <p className="text-md font-black text-slate-900">{track.status}</p>
                       <div className="flex justify-between text-sm text-slate-400 font-black tracking-wider">
                          <span>المنفذ: {track.deliveryAgent?.fullName || 'النظام'}</span>
                          <span className="font-jakarta">{formatDate(track.createdAt)}</span>
                       </div>
                     </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <p>لا توجد أحداث مسجلة حالياً</p>
                  <p className="text-xs mt-2">سيتم تحديث هذا القسم تلقائياً مع تقدم الطلب</p>
                </div>
              )}
              
              {/* Static workflow steps based on current status */}
              {req?.status === 'PENDING_ADMIN_REVISION' && (
                <div className="relative pr-12">
                   <div className="absolute right-0 top-1 w-10 h-10 rounded-2xl border-4 border-white flex items-center justify-center z-10 bg-slate-100 text-slate-300">
                     <div className="w-2 h-2 bg-current rounded-full" />
                   </div>
                   <div className="space-y-1">
                     <p className="text-md font-black text-slate-400 italic">بانتظار موافقة الأدمن</p>
                     <div className="flex justify-between text-sm text-slate-400 font-black tracking-wider">
                        <span>المنفذ: الأدمن</span>
                        <span className="font-jakarta">قيد الانتظار</span>
                     </div>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Request Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <FiAlertTriangle className="text-rose-500" /> إيقاف الطلب
              </h3>
              <button onClick={() => setShowCancelConfirm(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                <FiX size={20} />
              </button>
            </div>

            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <p className="text-sm text-rose-800 leading-relaxed">
                هل أنت متأكد من إيقاف الطلب <strong>#{requestId}</strong>؟
                <br />
                هذا الإجراء لا يمكن التراجع عنه وسيتم إخطار العميل والموردين.
              </p>
            </div>

            {cancelError && (
              <div className="p-3 bg-rose-100 text-rose-700 rounded-lg text-sm">
                {cancelError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                disabled={isCancelling}
              >
                إلغاء
              </button>
              <button
                onClick={async () => {
                  setIsCancelling(true);
                  setCancelError(null);
                  try {
                    await apiFetch(`/api/admin/requests/${requestId}/cancel`, "ADMIN", { method: "PATCH" });
                    setShowCancelConfirm(false);
                    request.refresh();
                  } catch (err: any) {
                    setCancelError(err.message || "فشل إيقاف الطلب");
                  } finally {
                    setIsCancelling(false);
                  }
                }}
                disabled={isCancelling}
                className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
              >
                {isCancelling ? <span className="animate-spin">⏳</span> : <FiX size={18} />}
                إيقاف الطلب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <FiList className="text-primary" /> سجل تغييرات الطلب
              </h3>
              <button onClick={() => setShowHistory(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                <FiX size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {(req as any)?.deliveryTracking?.length > 0 ? (
                (req as any).deliveryTracking.map((track: any, i: number) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-800">{track.status}</span>
                      <span className="text-xs text-slate-500">{formatDate(track.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-500">المنفذ: {track.deliveryAgent?.fullName || 'النظام'}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <p>لا توجد أحداث مسجلة لهذا الطلب</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowHistory(false)}
              className="w-full py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminRequestDetailsPage() {
  const params = useParams<{ requestId: string }>();
  const parsed = Number(params.requestId);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return <div className="p-20 text-center font-bold">معرف الطلب غير صالح.</div>;
  }

  return <AdminRequestDetails requestId={parsed} />;
}

