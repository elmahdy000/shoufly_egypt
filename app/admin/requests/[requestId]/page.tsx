"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/shoofly/button";
import { formatDate } from "@/lib/formatters";
import { StatusBadge } from "@/components/shoofly/status-badge";
import { StatCard } from "@/components/shoofly/stat-card";
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
  FiShare2,
  FiMessageSquare
} from "react-icons/fi";

function AdminRequestDetails({ requestId }: { requestId: number }) {
  const router = useRouter();
  const request = useAsyncData(() => getRequestDetails(requestId), [requestId]);
  const bids = useAsyncData(() => listAdminRequestBids(requestId), [requestId]);
  const [activeActionId, setActiveActionId] = useState<number | null>(null);

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

  if (request.loading) return <div className="p-10 text-center text-muted font-bold animate-pulse">بنجهز تفاصيل الطلب...</div>;

  const req = request.data;

  return (
    <div className="p-6 lg:p-10 max-w-[1400px] mx-auto space-y-8 pb-32 text-right dir-rtl">
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
            <h1 className="text-4xl font-black tracking-tight text-slate-900 border-r-4 border-primary pr-4">{req?.title}</h1>
            <StatusBadge status="active" label={req?.status ?? 'Pending'} />
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 pr-16 font-medium">
            <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-lg font-jakarta tracking-tight"><FiClock size={14}/> ID: {requestId}</span>
            <span className="flex items-center gap-1.5"><FiMapPin size={16} className="text-primary" /> {req?.address}</span>
            <span className="flex items-center gap-1.5"><FiMessageSquare size={16} /> التواصل مفعل</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href={`/messages?otherId=${req?.clientId}`}>
            <Button variant="secondary" className="gap-2 bg-slate-900 text-white border-none hover:bg-slate-800 h-14 px-6 rounded-2xl shadow-lg">
              <FiMessageSquare /> شات مع العميل
            </Button>
          </Link>
          <Button className="h-14 px-6 rounded-2xl shadow-lg border-2 border-rose-100 bg-white text-rose-600 hover:bg-rose-50 font-bold">إيقاف فوري للطلب</Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Details & Bids */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info Card */}
          <div className="shoofly-card bg-white p-10 space-y-10 border-2 border-slate-50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
            
            <div className="space-y-6">
              <div className="flex items-center gap-2 font-black text-2xl text-slate-900">
                <FiFileText className="text-primary" />
                <span>شرح المشكلة بالتفصيل</span>
              </div>
              <div className="text-slate-700 leading-relaxed bg-slate-50/80 p-6 rounded-3xl border border-slate-100 text-lg font-medium">
                {req?.description || 'لا يوجد وصف تفصيلي لهذا الطلب.'}
              </div>
            </div>
            
            {/* Visual Evidence */}
            <div className="space-y-6">
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-50 pb-4">
                <FiImage /> المعاينة البصرية للموقع
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[1, 2].map(i => (
                  <div key={i} className="aspect-square bg-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-slate-300 border-4 border-dashed border-slate-200 hover:border-primary/20 transition-all group">
                    <FiImage size={32} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] mt-2 font-bold uppercase">View Upload {i}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bids Section */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <FiActivity className="text-primary" /> عروض الموردين المتاحة
              </h2>
              <span className="text-sm font-black px-4 py-2 bg-primary/10 text-primary rounded-2xl border border-primary/20">
                {bids.data?.length ?? 0} عرض مقدم
              </span>
            </div>

            <div className="space-y-6">
              {bids.loading ? (
                <div className="text-center py-20 opacity-50 font-bold animate-pulse">بنفرز عروض الأسعار...</div>
              ) : (bids.data ?? []).length === 0 ? (
                <div className="shoofly-card p-12 text-center text-slate-400 font-bold border-dashed border-2">لسه مفيش عروض وصلت للطلب ده</div>
              ) : (bids.data ?? []).map((bid: any) => (
                <div key={bid.id} className="shoofly-card bg-white p-8 hover:border-primary/40 transition-all border-r-8 border-slate-100 group">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl border-4 border-white shadow-xl">
                        {bid.vendor?.fullName?.[0] || 'V'}
                      </div>
                      <div>
                        <p className="font-black text-xl text-slate-900">{bid.vendor?.fullName || `المورد #${bid.vendorId}`}</p>
                        <div className="flex items-center gap-2 mt-1">
                           <StatusBadge status={bid.status === 'SELECTED' ? 'completed' : 'active'} label={bid.status} />
                           <span className="text-[10px] text-slate-400 font-bold font-jakarta">UID-{bid.vendorId}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm min-w-[200px]">
                      <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-1 text-center">تكلفة العميل النهائية</p>
                      <p className="text-3xl font-black font-jakarta text-emerald-700 text-center">
                        {formatCurrency(bid.clientPrice || 0)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 mb-8 italic text-slate-600 font-medium leading-relaxed">
                    "{bid.description || 'لا يوجد تفاصيل إضافية للعرض.'}"
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 border-t border-slate-50 pt-6">
                    <Link href={`/messages?otherId=${bid.vendorId}`} className="w-full sm:w-auto">
                      <Button variant="secondary" className="w-full gap-2 h-12 rounded-xl bg-white border-2 border-slate-100 hover:bg-slate-50 font-bold">
                        <FiMessageSquare /> شات مع المورد
                      </Button>
                    </Link>
                    <Button 
                      onClick={() => handleForward(bid.id)}
                      isLoading={activeActionId === bid.id}
                      className="w-full sm:flex-1 h-12 rounded-xl font-black shadow-lg uppercase tracking-wider"
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
          <div className="shoofly-card bg-slate-900 text-white p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-2xl" />
                <h3 className="font-black text-xs text-primary uppercase tracking-[0.2em] relative z-10">بطاقة صاحب الطلب</h3>
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 relative z-10 transition-all hover:bg-white/10">
                  <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-2xl shadow-lg border-2 border-white/20">
                    <FiUser />
                  </div>
                  <div>
                    <p className="font-bold text-lg">{(req as any)?.clientName || `عميل #${req?.clientId}`}</p>
                    <p className="text-[10px] text-emerald-400 font-black uppercase tracking-tighter">حساب موثق بالعلامة الزرقاء</p>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-white/10 text-sm">
                   <div className="flex justify-between font-medium">
                      <span className="text-white/40">تاريخ إنشاء الطلب</span>
                      <span className="font-jakarta font-bold">{req?.createdAt ? formatDate(req.createdAt) : '---'}</span>
                   </div>
                   <div className="flex justify-between font-medium">
                      <span className="text-white/40">آخر تحديث</span>
                      <span className="font-jakarta font-bold">{req?.updatedAt ? formatDate(req.updatedAt) : '---'}</span>
                   </div>
                   <div className="flex justify-between font-medium">
                      <span className="text-white/40">معرف العميل</span>
                      <span className="font-jakarta font-bold">#{req?.clientId}</span>
                   </div>
                </div>
          </div>

          {/* Audit Trail - Dynamic from API */}
          <div className="shoofly-card bg-white p-8 space-y-8 border-2 border-slate-50">
            <h3 className="font-black text-xs text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-slate-50 pb-4">
              <FiCheckCircle className="text-primary" /> التسلسل الزمني للأحداث
            </h3>
            
            <div className="space-y-10 relative before:absolute before:right-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
              {(req as any)?.deliveryTracking?.length > 0 ? (
                (req as any).deliveryTracking.map((track: any, i: number) => (
                  <div key={i} className="relative pr-12">
                     <div className={`absolute right-0 top-1 w-10 h-10 rounded-2xl border-4 border-white flex items-center justify-center z-10 transition-all bg-primary text-white shadow-xl shadow-primary/20 scale-110`}>
                       <FiCheckCircle size={16} />
                     </div>
                     <div className="space-y-1">
                       <p className="text-md font-black text-slate-900">{track.status}</p>
                       <div className="flex justify-between text-[11px] text-slate-400 uppercase font-black tracking-wider">
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
                     <div className="flex justify-between text-[11px] text-slate-400 uppercase font-black tracking-wider">
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
