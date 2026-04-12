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
        {(data ?? []).map((item) => (
          <button key={item.id} onClick={() => markRead(item.id)} className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-right">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{item.type}</p>
              <span className="text-xs text-slate-500">{formatDate(item.createdAt)}</span>
            </div>
            <p className="mt-1 text-sm text-slate-600">{item.message}</p>
            <p className="mt-2 text-xs text-slate-400">{item.isRead ? "مقروء" : "اضغط للتعليم كمقروء"}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
