"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/shoofly/button";
import { ErrorState } from "@/components/shared/error-state";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import {
  completeDeliveryTask,
  failDeliveryTask,
  listDeliveryTasks,
} from "@/lib/api/delivery-agent";
import { 
  FiMapPin, 
  FiPhone, 
  FiCheckCircle, 
  FiXCircle,
  FiTruck,
  FiArrowLeft,
  FiPackage,
  FiClock,
  FiAlertCircle
} from "react-icons/fi";

function TaskDetail({ requestId }: { requestId: number }) {
  const router = useRouter();
  const { data, loading, error } = useAsyncData(
    () => listDeliveryTasks(),
    [requestId],
  );
  const [message, setMessage] = useState<string | null>(null);
  const [failReason, setFailReason] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);
  const [isFailing, setIsFailing] = useState(false);

  const task = data?.myTasks.find((t) => t.id === requestId);

  async function handleComplete() {
    try {
      setIsCompleting(true);
      await completeDeliveryTask(requestId);
      setMessage("تم تأكيد التسليم بنجاح");
      setTimeout(() => router.push("/delivery"), 1500);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "فشل تأكيد التسليم");
      setIsCompleting(false);
    }
  }

  async function handleFail() {
    try {
      setIsFailing(true);
      await failDeliveryTask(requestId, failReason || undefined);
      setMessage("تم تسجيل فشل التسليم");
      setTimeout(() => router.push("/delivery"), 1500);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "فشل تسجيل المشكلة");
      setIsFailing(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
      <div className="flex flex-col items-center text-[#767684]">
        <div className="w-12 h-12 border-3 border-indigo-100 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">جاري تحميل تفاصيل الطلب...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-[#F8F9FA] p-6">
      <ErrorState message={error} />
    </div>
  );
  
  if (!task) return (
    <div className="min-h-screen bg-[#F8F9FA] p-6">
      <ErrorState message="المهمة غير موجودة أو لم تُسند إليك" />
    </div>
  );

  const lastStatus = task.deliveryTracking?.[0]?.status ?? "OUT_FOR_DELIVERY";
  const statusLabel = lastStatus === "OUT_FOR_DELIVERY" ? "جاري التوصيل" : "قيد الإجراء";
  const statusColor = lastStatus === "OUT_FOR_DELIVERY" ? "indigo" : "amber";

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 lg:pb-10 font-sans dir-rtl text-right">
      {/* Page Header */}
      <div className="bg-white border-b border-[#E7E7E7]">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-6">
          <div className="flex items-center gap-3">
            <Link 
              href="/delivery/tasks" 
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
            >
              <FiArrowLeft size={20} />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-[#0F1111] truncate">{task.title}</h1>
              <p className="text-sm text-[#565959] font-medium mt-0.5">طلب #{task.id}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-8 space-y-6">
        {/* Status Banner */}
        <div className={`p-4 rounded-xl border ${
          statusColor === "indigo" 
            ? 'bg-indigo-50 border-indigo-200' 
            : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              statusColor === "indigo" ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'
            }`}>
              <FiTruck size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0F1111]">حالة التوصيل</p>
              <p className={`text-sm font-medium ${
                statusColor === "indigo" ? 'text-indigo-700' : 'text-amber-700'
              }`}>{statusLabel}</p>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-xl text-sm font-medium ${
            message.includes('نجاح') 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              {message.includes('نجاح') ? <FiCheckCircle size={18} /> : <FiAlertCircle size={18} />}
              {message}
            </div>
          </div>
        )}

        {/* Delivery Info Card */}
        <div className="bg-white rounded-2xl border border-[#E7E7E7] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#E7E7E7]">
            <h2 className="text-base font-bold text-[#0F1111] flex items-center gap-2">
              <FiPackage size={18} className="text-[#565959]" /> تفاصيل الطلب
            </h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                <FiMapPin size={18} />
              </div>
              <div>
                <p className="text-xs text-[#565959] font-medium mb-1">عنوان التوصيل</p>
                <p className="text-sm font-semibold text-[#0F1111]">{task.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                <FiPhone size={18} />
              </div>
              <div>
                <p className="text-xs text-[#565959] font-medium mb-1">رقم التواصل</p>
                <p className="text-sm font-semibold text-[#0F1111]" dir="ltr">{task.deliveryPhone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Card */}
        <div className="bg-white rounded-2xl border border-[#E7E7E7] shadow-sm p-6 space-y-5">
          <h2 className="text-base font-bold text-[#0F1111] flex items-center gap-2">
            <FiCheckCircle size={18} className="text-emerald-600" /> إجراءات التوصيل
          </h2>
          
          <Button 
            onClick={handleComplete} 
            className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600"
            isLoading={isCompleting}
          >
            <FiCheckCircle size={18} /> 
            {isCompleting ? 'جاري التأكيد...' : 'تم التسليم بنجاح'}
          </Button>

          <div className="border-t border-[#E7E7E7] pt-5">
            <div className="flex items-center gap-2 mb-3">
              <FiXCircle size={16} className="text-rose-500" />
              <p className="text-sm font-semibold text-[#0F1111]">تسجيل مشكلة (اختياري)</p>
            </div>
            <input
              value={failReason}
              onChange={(e) => setFailReason(e.target.value)}
              placeholder="مثال: العميل غير موجود، العنوان غير صحيح..."
              className="w-full px-4 py-3 bg-slate-50 border-2 border-[#E7E7E7] rounded-xl text-sm outline-none focus:border-rose-400 transition-colors mb-3"
            />
            <Button 
              variant="danger" 
              onClick={handleFail} 
              className="w-full gap-2"
              isLoading={isFailing}
            >
              <FiXCircle size={18} /> 
              {isFailing ? 'جاري التسجيل...' : 'تسجيل مشكلة في التسليم'}
            </Button>
          </div>
        </div>

        {/* Tips Card */}
        <div className="bg-slate-50 rounded-xl p-4 border border-[#E7E7E7]">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <FiClock size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0F1111] mb-1">نصيحة سريعة</p>
              <p className="text-xs text-[#565959]">
                اتصل بالعميل قبل الوصول لتأكيد العنوان. في حالة عدم الرد، انتظر 10 دقائق قبل تسجيل مشكلة.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DeliveryTaskDetailPage() {
  const params = useParams<{ requestId: string }>();
  const parsed = Number(params.requestId);
  if (!Number.isFinite(parsed) || parsed <= 0)
    return (
      <div className="min-h-screen bg-[#F8F9FA] p-6">
        <ErrorState message="معرف طلب غير صحيح" />
      </div>
    );
  return <TaskDetail requestId={parsed} />;
}
