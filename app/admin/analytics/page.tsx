"use client";

import { useCallback, useMemo, useState } from "react";
import type { ElementType } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatCurrency } from "@/lib/formatters";
import {
  BarChart3,
  CheckCircle,
  Download,
  DollarSign,
  RefreshCw,
  ShoppingBag,
  Star,
  Target,
} from "lucide-react";

interface AnalyticsData {
  overview: {
    totalAdminCommission: number;
    totalGMV: number;
    fulfillmentRate: number;
    avgPlatformRating: number;
  };
  topCategories: { name: string; requestCount: number }[];
  trends: { day: string; requests: number; revenue: number }[];
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  createdAt: string;
}

interface Vendor {
  id: number;
  fullName: string;
  walletBalance: number;
  isVerified: boolean;
}

const RANGE_OPTIONS = [
  { key: "7d", label: "٧ أيام", days: 7 },
  { key: "30d", label: "٣٠ يوم", days: 30 },
  { key: "90d", label: "٩٠ يوم", days: 90 },
] as const;

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<(typeof RANGE_OPTIONS)[number]["key"]>("7d");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const { data: analytics, loading: loadingAnalytics, refresh: refreshAnalytics } = useAsyncData<AnalyticsData>(
    () => apiFetch("/api/admin/analytics/overview", "ADMIN"),
    []
  );
  const { data: transactions, loading: loadingTx, refresh: refreshTx } = useAsyncData<Transaction[]>(
    () => apiFetch("/api/admin/finance/transactions?limit=500", "ADMIN"),
    []
  );
  const { data: vendors, loading: loadingVendors, refresh: refreshVendors } = useAsyncData<Vendor[]>(
    () => apiFetch("/api/admin/vendors?limit=500", "ADMIN"),
    []
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([refreshAnalytics(), refreshTx(), refreshVendors()]);
    setLastUpdated(new Date());
    setIsRefreshing(false);
  }, [refreshAnalytics, refreshTx, refreshVendors]);

  const selectedRange = useMemo(
    () => RANGE_OPTIONS.find((opt) => opt.key === dateRange) ?? RANGE_OPTIONS[0],
    [dateRange]
  );

  const filteredTransactions = useMemo(() => {
    const list = transactions ?? [];
    const minDate = lastUpdated.getTime() - selectedRange.days * 24 * 60 * 60 * 1000;
    return list.filter((tx) => new Date(tx.createdAt).getTime() >= minDate);
  }, [transactions, selectedRange.days, lastUpdated]);

  const txTypeCounts = useMemo(() => {
    const map = new Map<string, number>();
    filteredTransactions.forEach((tx) => {
      const key = tx.type === "ADMIN_COMMISSION" ? "PLATFORM_FEE" : tx.type;
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [filteredTransactions]);

  const topVendors = useMemo(() => {
    return [...(vendors ?? [])]
      .sort((a, b) => Number(b.walletBalance) - Number(a.walletBalance))
      .slice(0, 5);
  }, [vendors]);

  const trends = analytics?.trends ?? [];
  const maxTrendRequests = Math.max(...trends.map((t) => t.requests), 1);

  const handleExportCsv = useCallback(() => {
    const rows = [
      ["metric", "value"],
      ["total_gmv", String(analytics?.overview.totalGMV ?? 0)],
      ["platform_commission", String(analytics?.overview.totalAdminCommission ?? 0)],
      ["fulfillment_rate", String(analytics?.overview.fulfillmentRate ?? 0)],
      ["avg_platform_rating", String(analytics?.overview.avgPlatformRating ?? 0)],
      ["range_days", String(selectedRange.days)],
      ["transactions_in_range", String(filteredTransactions.length)],
    ];

    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin-analytics-${dateRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [analytics, dateRange, filteredTransactions.length, selectedRange.days]);

  return (
    <div className="admin-page" dir="rtl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BarChart3 size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">التحليلات</h1>
            <p className="text-sm text-slate-500">آخر تحديث: {lastUpdated.toLocaleString("ar-EG")}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
            {RANGE_OPTIONS.map((range) => (
              <button
                key={range.key}
                onClick={() => setDateRange(range.key)}
                className={`rounded-lg px-4 py-1.5 text-sm font-bold transition-colors ${
                  dateRange === range.key ? "bg-white text-slate-900" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-primary"
            aria-label="تحديث البيانات"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          </button>

          <button
            onClick={handleExportCsv}
            className="flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-800"
          >
            <Download size={14} />
            تصدير CSV
          </button>
        </div>
      </div>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          title="إجمالي المعاملات"
          value={loadingAnalytics ? "—" : formatCurrency(analytics?.overview.totalGMV ?? 0)}
          icon={ShoppingBag}
        />
        <MetricCard
          title="أرباح المنصة"
          value={loadingAnalytics ? "—" : formatCurrency(analytics?.overview.totalAdminCommission ?? 0)}
          icon={DollarSign}
        />
        <MetricCard
          title="معدل التنفيذ"
          value={loadingAnalytics ? "—" : `${Math.round(analytics?.overview.fulfillmentRate ?? 0)}%`}
          icon={Target}
        />
        <MetricCard
          title="متوسط التقييم"
          value={loadingAnalytics ? "—" : `${(analytics?.overview.avgPlatformRating ?? 0).toFixed(1)}`}
          icon={Star}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card p-5">
          <h3 className="text-base font-bold text-slate-900 mb-4">اتجاه الطلبات الأسبوعي</h3>
          <div className="h-64 flex items-end gap-3" dir="ltr">
            {trends.map((item) => {
              const pct = Math.max((item.requests / maxTrendRequests) * 100, 8);
              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full h-52 flex items-end">
                    <div className="w-full rounded-t-lg bg-primary/80" style={{ height: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-slate-500 font-jakarta">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-base font-bold text-slate-900 mb-4">توزيع أنواع المعاملات</h3>
          {loadingTx ? (
            <div className="h-64 rounded-xl bg-slate-50 animate-pulse" />
          ) : txTypeCounts.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 font-bold">لا توجد بيانات</div>
          ) : (
            <div className="space-y-3">
              {txTypeCounts.map(([type, count]) => (
                <div key={type} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <span className="text-sm text-slate-600 font-jakarta">{type}</span>
                  <span className="text-sm font-black text-slate-900 font-jakarta">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card overflow-hidden">
          <div className="border-b border-slate-100 p-4">
            <h3 className="text-base font-bold text-slate-900">أفضل التجار حسب الرصيد</h3>
          </div>
          <div className="p-4 space-y-2">
            {loadingVendors ? (
              Array(5)
                .fill(0)
                .map((_, i) => <div key={i} className="h-12 rounded-lg bg-slate-50 animate-pulse" />)
            ) : (
              topVendors.map((vendor) => (
                <div key={vendor.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">{vendor.fullName}</span>
                    {vendor.isVerified && <CheckCircle size={14} className="text-emerald-600" />}
                  </div>
                  <span className="font-jakarta text-sm font-black text-slate-900">
                    {formatCurrency(vendor.walletBalance)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="border-b border-slate-100 p-4">
            <h3 className="text-base font-bold text-slate-900">أفضل الفئات</h3>
          </div>
          <div className="p-4 space-y-3">
            {(analytics?.topCategories ?? []).slice(0, 5).map((category) => {
              const max = analytics?.topCategories?.[0]?.requestCount || 1;
              const pct = Math.round((category.requestCount / max) * 100);
              return (
                <div key={category.name} className="rounded-lg border border-slate-100 p-3">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-900">{category.name}</span>
                    <span className="font-jakarta text-slate-500">{category.requestCount}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100">
                    <div className="h-1.5 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: ElementType;
}) {
  return (
    <div className="glass-card p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon size={18} />
      </div>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-xl font-black text-slate-900 font-jakarta">{value}</p>
    </div>
  );
}
