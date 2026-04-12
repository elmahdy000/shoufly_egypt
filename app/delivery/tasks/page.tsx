"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/shoofly/button";
import { ErrorState } from "@/components/shared/error-state";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import {
  acceptDeliveryTask,
  listDeliveryTasks,
} from "@/lib/api/delivery-agent";
import { 
  FiMapPin, 
  FiPhone, 
  FiTruck, 
  FiArrowLeft,
  FiPackage,
  FiCheckCircle,
  FiClock
} from "react-icons/fi";

export default function DeliveryTasksPage() {
  const { data, loading, error, setData } = useAsyncData(
    () => listDeliveryTasks(),
    [],
  );
  const [message, setMessage] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);

  async function accept(requestId: number) {
    try {
      setAcceptingId(requestId);
      setMessage(null);
      await acceptDeliveryTask(requestId);
      setMessage(`تم استلام الطلب #${requestId} بنجاح`);
      const updated = await listDeliveryTasks();
      setData(updated);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "فشل استلام الطلب");
    } finally {
      setAcceptingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 lg:pb-10 font-sans dir-rtl text-right">
      {/* Page Header */}
      <div className="bg-white border-b border-[#E7E7E7]">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-6">
          <div className="flex items-center gap-3">
            <Link 
              href="/delivery" 
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
            >
              <FiArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-[#0F1111]">طلبات التوصيل</h1>
              <p className="text-sm text-[#565959] font-medium mt-0.5">الطلبات المتاحة والحالية</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-8 space-y-6">
        {message && (
          <div className={`p-4 rounded-xl text-sm font-medium ${
            message.includes('نجاح') 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {message}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-[#767684]">
             <div className="w-12 h-12 border-3 border-indigo-100 border-t-indigo-500 rounded-full animate-spin mb-4" />
             <p className="text-sm font-medium">جاري تحميل الطلبات...</p>
          </div>
        )}
        
        {error && <ErrorState message={error} />}

        {/* My Active Tasks */}
        {data?.myTasks && data.myTasks.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-[#0F1111] flex items-center gap-2">
              <FiTruck size={18} className="text-indigo-600" /> طلباتي الحالية
            </h2>
            <div className="grid gap-4">
              {data.myTasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/delivery/tasks/${task.id}`}
                  className="bg-white rounded-2xl border border-[#E7E7E7] shadow-sm p-5 hover:border-indigo-300 hover:shadow-md transition-all group block"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-[#0F1111] group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-2 text-xs text-[#565959]">
                        <FiMapPin size={14} className="text-[#767684] shrink-0" />
                        <span className="truncate">{task.address}</span>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${
                      task.deliveryTracking?.[0]?.status === "OUT_FOR_DELIVERY"
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}>
                      {task.deliveryTracking?.[0]?.status === "OUT_FOR_DELIVERY" ? "جاري التوصيل" : "قيد الإجراء"}
                    </span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#E7E7E7] flex items-center justify-between">
                    <span className="text-xs text-[#767684]">#{task.id}</span>
                    <span className="text-xs font-medium text-indigo-600 flex items-center gap-1">
                      <FiCheckCircle size={12} /> تحديث الحالة
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Available Tasks */}
        {(data?.available ?? []).length > 0 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-[#0F1111] flex items-center gap-2">
              <FiPackage size={18} className="text-amber-600" /> طلبات جاهزة للاستلام
            </h2>
            <div className="grid gap-4">
              {(data?.available ?? []).map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-2xl border border-[#E7E7E7] shadow-sm p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-[#0F1111] line-clamp-1">
                        {task.title}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full mt-2">
                        <FiClock size={10} /> جاهز للاستلام
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center gap-2 text-xs text-[#565959]">
                      <FiMapPin size={14} className="text-[#767684] shrink-0" />
                      <span className="truncate">{task.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#565959]">
                      <FiPhone size={14} className="text-[#767684] shrink-0" />
                      <span dir="ltr">{task.deliveryPhone}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => accept(task.id)} 
                    className="w-full mt-4"
                    isLoading={acceptingId === task.id}
                  >
                    {acceptingId === task.id ? 'جاري الاستلام...' : 'قبول واستلام الطلب'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && (data?.available.length ?? 0) === 0 && (data?.myTasks.length ?? 0) === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E7E7E7] shadow-sm p-12 text-center">
             <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
               <FiPackage size={28} />
             </div>
             <h3 className="text-base font-semibold text-[#0F1111] mb-2">لا توجد طلبات متاحة</h3>
             <p className="text-sm text-[#565959]">انتظر حتى يتم إضافة طلبات جديدة</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
