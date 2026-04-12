"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ErrorState } from "@/components/shared/error-state";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { listDeliveryTasks } from "@/lib/api/delivery-agent";
import { 
  FiPackage, 
  FiMap, 
  FiArrowLeft, 
  FiTruck,
  FiNavigation,
  FiMapPin,
  FiPhone
} from "react-icons/fi";

export default function DeliveryDashboard() {
  const { data, loading, error } = useAsyncData(() => listDeliveryTasks(), []);

  const stats = useMemo(
    () => ({
      available: data?.available.length ?? 0,
      myTasks: data?.myTasks.length ?? 0,
    }),
    [data],
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 lg:pb-10 font-sans dir-rtl text-right">
      {/* Page Header */}
      <div className="bg-white border-b border-[#E7E7E7]">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <FiTruck size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0F1111]">توصيلاتي</h1>
              <p className="text-sm text-[#565959] font-medium mt-0.5">طلبات التوصيل القريبة والمتاحة</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-8 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/delivery/tasks" className="block">
            <div className="bg-white rounded-2xl border border-[#E7E7E7] shadow-sm p-5 hover:border-indigo-300 hover:shadow-md transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  <FiPackage size={20} />
                </div>
                <p className="text-sm text-[#565959] font-medium">أوردراتي</p>
              </div>
              <p className="text-2xl font-bold text-[#0F1111]">{stats.myTasks}</p>
              <p className="text-xs text-[#767684] mt-1">اللي بتوصلها دلوقتي</p>
            </div>
          </Link>
          
          <Link href="/delivery/tasks" className="block">
            <div className="bg-white rounded-2xl border border-[#E7E7E7] shadow-sm p-5 hover:border-amber-300 hover:shadow-md transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <FiMap size={20} />
                </div>
                <p className="text-sm text-[#565959] font-medium">أوردرات قريبة</p>
              </div>
              <p className="text-2xl font-bold text-[#0F1111]">{stats.available}</p>
              <p className="text-xs text-[#767684] mt-1">جاهزة للتوصيل</p>
            </div>
          </Link>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-[#767684]">
             <div className="w-12 h-12 border-3 border-indigo-100 border-t-indigo-500 rounded-full animate-spin mb-4" />
             <p className="text-sm font-medium">جاري تحميل الطلبات...</p>
          </div>
        )}
        
        {error && <ErrorState message={error} />}

        {/* Active Tasks Feed */}
        {data?.myTasks && data.myTasks.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#0F1111]">أوردرات بوصلها دلوقتي</h2>
              <Link href="/delivery/tasks" className="text-sm font-medium text-[#FF5A00] hover:text-[#FF5A00]/80 flex items-center gap-1">
                عرض الكل <FiArrowLeft size={14} />
              </Link>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {data.myTasks.map((task: any) => {
                const statusStr = task.deliveryTracking?.[0]?.status ?? "OUT_FOR_DELIVERY";
                return (
                  <Link
                    key={task.id}
                    href={`/delivery/tasks/${task.id}`}
                    className="bg-white rounded-2xl border border-[#E7E7E7] shadow-sm p-5 hover:border-indigo-300 hover:shadow-md transition-all group block"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-semibold text-sm text-[#0F1111] group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {task.title}
                      </h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${
                        statusStr === "OUT_FOR_DELIVERY" 
                          ? 'bg-indigo-50 text-indigo-600' 
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {statusStr === "OUT_FOR_DELIVERY" ? "جاري التوصيل" : "قيد الإجراء"}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-[#565959]">
                        <FiMapPin size={14} className="text-[#767684] shrink-0" />
                        <span className="truncate">{task.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#565959]">
                        <FiPhone size={14} className="text-[#767684] shrink-0" />
                        <span dir="ltr">{task.deliveryPhone}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#E7E7E7] flex items-center justify-between">
                      <span className="text-xs text-[#767684]">#{task.id}</span>
                      <span className="text-xs font-medium text-indigo-600 flex items-center gap-1">
                        <FiNavigation size={12} /> تفاصيل التوصيل
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && stats.available === 0 && stats.myTasks === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E7E7E7] shadow-sm p-12 text-center">
             <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
               <FiPackage size={28} />
             </div>
             <h3 className="text-base font-semibold text-[#0F1111] mb-2">لا توجد طلبات</h3>
             <p className="text-sm text-[#565959]">لا توجد طلبات جديدة في منطقتك حالياً</p>
          </div>
        ) : null}

        {/* Available Tasks Link */}
        {stats.available > 0 && (
          <Link
            href="/delivery/tasks"
            className="bg-white rounded-2xl border border-[#E7E7E7] shadow-sm p-5 flex items-center justify-between hover:border-amber-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                <FiMap size={20} />
              </div>
              <div>
                <span className="font-semibold text-[#0F1111] block">استكشف الأوردرات المتاحة</span>
                <span className="text-xs text-[#565959]">{stats.available} طلب جاهز للتوصيل</span>
              </div>
            </div>
            <div className="text-[#767684] group-hover:text-amber-600 transition-colors">
              <FiArrowLeft size={20} />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
