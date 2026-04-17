"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingBlock } from "@/components/ui/loading-block";
import { SectionHeader } from "@/components/ui/section-header";
import { formatDate } from "@/lib/formatters";
import { useNotificationsStream } from "@/lib/hooks/use-notifications-stream";

export default function VendorNotificationsPage() {
  const { data, loading, error, markRead } = useNotificationsStream("VENDOR", 4000);

  return (
    <div className="space-y-4">
      <SectionHeader title="الإشعارات" subtitle="تنبيهات حساب البائع" />
      {loading ? <LoadingBlock label="جاري سحب الإشعارات الحية..." /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error && (data?.length ?? 0) === 0 ? (
        <EmptyState title="لا توجد إشعارات" description="أنت على اطلاع دائم بجميع التحديثات." />
      ) : null}

      <div className="space-y-3">
        {(data ?? []).map((item) => {
          const isRequest = item.type?.includes("REQUEST");
          const isBid = item.type?.includes("BID");
          
          return (
            <button 
              key={item.id} 
              onClick={() => markRead(item.id)} 
              className={`w-full rounded-2xl border transition-all text-right group p-4 hover:shadow-md ${
                item.isRead ? "bg-white border-slate-100 opacity-70" : "bg-white border-primary/20 shadow-sm ring-1 ring-primary/5"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isRequest ? "bg-amber-50 text-amber-600" : isBid ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                }`}>
                  {isRequest ? <FiSearch size={18} /> : isBid ? <FiCheckCircle size={18} /> : <FiZap size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-sm font-bold ${item.isRead ? "text-slate-600" : "text-slate-900"}`}>
                      {item.title || "تنبيه جديد"}
                    </p>
                    <span className="text-[10px] font-medium text-slate-400">{formatDate(item.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {item.message}
                  </p>
                  {!item.isRead && (
                    <div className="mt-3 flex items-center gap-1.5 text-[9px] font-black text-primary uppercase">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
                      جديد - اضغط للقراءة
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
