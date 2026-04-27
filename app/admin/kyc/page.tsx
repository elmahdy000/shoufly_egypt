"use client";

import { useState } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatDate } from "@/lib/formatters";
import { 
  FiCheck, 
  FiX, 
  FiUser, 
  FiCalendar, 
  FiImage, 
  FiEye,
  FiAlertCircle,
  FiArrowRight
} from "react-icons/fi";
import Link from "next/link";

interface PendingKyc {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  idCardFrontUrl: string;
  idCardBackUrl: string;
  kycSubmissionDate: string;
}

export default function AdminKycPage() {
  const { data: requests, loading, refresh } = useAsyncData<PendingKyc[]>(() => apiFetch('/api/admin/kyc', "ADMIN"), []);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const handleReview = async (userId: number, status: 'APPROVED' | 'REJECTED') => {
    let reason = "";
    if (status === 'REJECTED') {
      reason = prompt("يا ريت تكتب سبب الرفض عشان المستخدم يعرف:") || "البيانات غير واضحة";
    }

    setProcessingId(userId);
    try {
      await apiFetch(`/api/admin/kyc/${userId}`, "ADMIN", {
        method: "PATCH",
        body: { status, reason }
      });
      refresh();
    } catch (err) {
      alert("حصلت مشكلة وأنا بحدث الحالة");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans dir-rtl text-right">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
           <div className="flex items-center gap-3">
             <Link href="/admin" className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-primary">
                <FiArrowRight size={20} />
             </Link>
             <h1 className="text-2xl font-black text-slate-900">طلبات توثيق الهوية</h1>
           </div>
           <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl text-xs font-bold border border-amber-200">
             يوجد {requests?.length || 0} طلب معلق
           </div>
        </div>

        {loading && <div className="text-center py-20 text-slate-400">جاري تحميل الطلبات...</div>}
        
        {!loading && requests?.length === 0 && (
          <div className="bg-white rounded-[2rem] border border-slate-200 p-20 text-center shadow-sm">
             <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300">
               <FiCheck size={40} />
             </div>
             <h3 className="text-lg font-bold text-slate-900 mb-2">مفيش طلبات معلقة دلوقتي</h3>
             <p className="text-sm text-slate-500">كل التجار اللي رفعوا بياناتهم اتراجعوا خلاص.</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {requests?.map((req) => (
            <div key={req.id} className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Info Section */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
                      <FiUser size={24} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">{req.fullName}</h3>
                      <p className="text-xs text-slate-500">{req.email} | {req.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <FiCalendar size={14} /> تاريخ التقديم: {formatDate(req.kycSubmissionDate)}
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      onClick={() => handleReview(req.id, 'APPROVED')}
                      disabled={processingId === req.id}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                    >
                      {processingId === req.id ? 'جاري...' : <><FiCheck /> موافقة وتوثيق</>}
                    </button>
                    <button 
                      onClick={() => handleReview(req.id, 'REJECTED')}
                      disabled={processingId === req.id}
                      className="flex-1 bg-white border-2 border-rose-100 text-rose-500 hover:bg-rose-50 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      {processingId === req.id ? 'جاري...' : <><FiX /> رفض الطلب</>}
                    </button>
                  </div>
                </div>

                {/* Images Section */}
                <div className="lg:w-[450px] grid grid-cols-2 gap-3">
                   <div className="space-y-2">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">وش البطاقة</p>
                     <div 
                       className="aspect-[1.6/1] bg-slate-50 rounded-xl overflow-hidden border border-slate-200 relative group cursor-zoom-in"
                       onClick={() => setViewingImage(req.idCardFrontUrl)}
                     >
                        <img src={req.idCardFrontUrl} alt="Front" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <FiEye size={20} />
                        </div>
                     </div>
                   </div>
                   <div className="space-y-2">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">ظهر البطاقة</p>
                     <div 
                       className="aspect-[1.6/1] bg-slate-50 rounded-xl overflow-hidden border border-slate-200 relative group cursor-zoom-in"
                       onClick={() => setViewingImage(req.idCardBackUrl)}
                     >
                        <img src={req.idCardBackUrl} alt="Back" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <FiEye size={20} />
                        </div>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      {viewingImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 p-10 flex items-center justify-center" onClick={() => setViewingImage(null)}>
           <button className="absolute top-10 right-10 text-white hover:text-rose-400 transition-colors">
              <FiX size={40} />
           </button>
           <img src={viewingImage} alt="Fullscreen" className="max-w-full max-h-full object-contain shadow-2xl" />
        </div>
      )}
    </div>
  );
}
