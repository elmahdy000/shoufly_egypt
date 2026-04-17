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
    <div className="p-6 lg:p-8 space-y-6 min-h-screen" dir="rtl">

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">التحليلات والبيانات</h1>
          <p className="text-sm text-gray-500 mt-1">آخر تحديث: {lastUpdated.toLocaleString("ar-EG")}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
            {RANGE_OPTIONS.map((range) => (
              <button
                key={range.key}
                onClick={() => setDateRange(range.key)}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-all ${
                  dateRange === range.key 
                    ? "bg-orange-50 text-orange-600" 
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            className="w-9 h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
            title="تحديث البيانات"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition-colors"
          >
            <Download size={14} />
            تصدير
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="إجمالي المبيعات"
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
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trends Chart */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">اتجاه الطلبات</h3>
          <div className="h-64 flex items-end gap-2" dir="ltr">
            {trends.length > 0 ? trends.map((item, idx) => {
              const pct = Math.max((item.requests / maxTrendRequests) * 100, 5);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full h-48 flex items-end justify-center">
                    <div className="w-full rounded-t-md bg-orange-500/70 hover:bg-orange-500 transition-colors" style={{ height: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{item.day}</span>
                </div>
              );
            }) : (
              <div className="flex items-center justify-center w-full text-gray-400">لا توجد بيانات</div>
            )}
          </div>
        </div>

        {/* Transaction Types */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">أنواع المعاملات</h3>
          {loadingTx ? (
            <div className="space-y-3">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : txTypeCounts.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 font-medium">لا توجد بيانات</div>
          ) : (
            <div className="space-y-2">
              {txTypeCounts.slice(0, 6).map(([type, count]) => {
                const txArabicMap: Record<string, string> = {
                  WALLET_TOPUP: "شحن رصيد",
                  ESCROW_DEPOSIT: "دفع متجمد",
                  ESCROW_RELEASE: "تسليم فلوس",
                  WITHDRAWAL: "سحب أرباح",
                  REFUND: "فلوس راجعة",
                  PLATFORM_FEE: "مكسب التطبيق",
                  VENDOR_PAYOUT: "أرباح مستلمة",
                };
                return (
                  <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="text-sm font-medium text-gray-700">{txArabicMap[type] || type}</span>
                    <span className="text-sm font-bold text-gray-900 tabular-nums">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Vendors */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900">أفضل الموردين</h3>
          </div>
          <div className="p-6 space-y-3">
            {loadingVendors ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              ))
            ) : topVendors.length === 0 ? (
              <div className="py-8 text-center text-gray-400 font-medium">لا توجد موردين</div>
            ) : (
              topVendors.map((vendor) => (
                <div key={vendor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm font-semibold text-gray-900">{vendor.fullName}</span>
                    {vendor.isVerified && (
                      <CheckCircle size={14} className="text-green-600 shrink-0" />
                    )}
                  </div>
                  <span className="text-sm font-bold text-gray-900 tabular-nums">{formatCurrency(vendor.walletBalance)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900">أفضل الفئات</h3>
          </div>
          <div className="p-6 space-y-4">
            {(analytics?.topCategories ?? []).slice(0, 5).map((category) => {
              const max = analytics?.topCategories?.[0]?.requestCount || 1;
              const pct = Math.round((category.requestCount / max) * 100);
              return (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">{category.name}</span>
                    <span className="text-sm font-bold text-gray-600 tabular-nums">{category.requestCount}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
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
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-gray-200 transition-all">
      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-3">
        <Icon size={18} className="text-orange-500" />
      </div>
      <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
      <p className="text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
    </div>
  );
}
