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
  MapPin, 
  Phone, 
  Truck, 
  ArrowLeft,
  Package,
  CheckCircle,
  Clock
} from "lucide-react";

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
      setMessage(`ألف مبروك! استلمت الأوردر #${requestId} بنجاح`);
      const updated = await listDeliveryTasks();
      setData(updated);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "للأسف ملقيناش الأوردر أو حد تاني خده");
    } finally {
      setAcceptingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 lg:pb-10 font-sans dir-rtl text-right">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/delivery" 
              className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-all border border-slate-100 shadow-sm"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">أوردراتك وتوصيلاتك</h1>
              <p className="text-sm text-slate-500 font-medium mt-1">تقدر تتابع كل المشاوير من هنا</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-8 space-y-6">
        {message && (
          <div className={`p-4 rounded-2xl text-sm font-bold shadow-sm ${
            message.includes('مبروك') 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
              : 'bg-rose-50 text-rose-700 border border-rose-100'
          }`}>
            {message}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
             <div className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
             <p className="text-sm font-bold">بيحمل الأوردرات...</p>
          </div>
        )}
        
        {error && <ErrorState message={error} />}

        {/* My Active Tasks */}
        {data?.myTasks && data.myTasks.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Truck size={20} className="text-primary" /> أوردرات في الطريق
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.myTasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/delivery/tasks/${task.id}`}
                  className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 p-5 hover:border-primary/30 hover:shadow-2xl transition-all group block"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-3 text-xs font-medium text-slate-500">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                          <MapPin size={14} className="text-slate-400" />
                        </div>
                        <span className="truncate leading-relaxed">{task.address}</span>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 shadow-sm ${
                      task.deliveryTracking?.[0]?.status === "OUT_FOR_DELIVERY"
                        ? 'bg-primary/10 text-primary'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {task.deliveryTracking?.[0]?.status === "OUT_FOR_DELIVERY" ? "في السكة" : "بيتجهز"}
                    </span>
                  </div>
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">رقم: {task.id}</span>
                    <span className="text-xs font-bold text-primary flex items-center gap-1.5 group-hover:gap-2 transition-all">
                      <CheckCircle size={14} /> حدث حالة الأوردر
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Available Tasks */}
        {(data?.available ?? []).length > 0 && (
          <div className="space-y-4 pt-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Package size={20} className="text-amber-500" /> أوردرات مستنية حد يوصلها
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(data?.available ?? []).map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 p-5 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full -z-0 opacity-50" />
                  <div className="flex items-start justify-between gap-3 relative z-10">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 line-clamp-1 mb-3">
                        {task.title}
                      </h3>
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 bg-amber-50 text-amber-600 rounded-full shadow-sm">
                        <Clock size={12} /> جاهز تطلع بيه
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mt-5 relative z-10">
                    <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                        <MapPin size={14} className="text-slate-400" />
                      </div>
                      <span className="truncate leading-relaxed">{task.address}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                        <Phone size={14} className="text-slate-400" />
                      </div>
                      <span dir="ltr">{task.deliveryPhone}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => accept(task.id)} 
                    className="w-full mt-6 h-12 rounded-xl bg-slate-900 text-white font-bold relative z-10 shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-colors"
                    isLoading={acceptingId === task.id}
                  >
                    {acceptingId === task.id ? 'جاري التأكيد...' : 'استلم ووصل الأوردر'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && (data?.available.length ?? 0) === 0 && (data?.myTasks.length ?? 0) === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 p-12 text-center mt-10 overflow-hidden relative">
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-slate-100/50 via-transparent to-transparent opacity-50"></div>
             <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400 relative z-10">
               <Package size={32} />
             </div>
             <h3 className="text-lg font-bold text-slate-900 mb-2 relative z-10">المنطقة هادية دلوقتي</h3>
             <p className="text-sm font-medium text-slate-500 relative z-10">بمجرد ما يكون فيه أوردر جديد هينزلك هنا علطول</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
