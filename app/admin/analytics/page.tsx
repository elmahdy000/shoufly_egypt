"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useAsyncData } from '@/lib/hooks/use-async-data';
import { apiFetch } from '@/lib/api/client';
import { formatCurrency } from '@/lib/formatters';
import {
  FiTrendingUp, FiUsers, FiPackage, FiBarChart2,
  FiStar, FiCheckCircle, FiRefreshCw, FiArrowUpRight,
  FiDollarSign
} from 'react-icons/fi';

interface AnalyticsData {
  overview: {
    totalAdminCommission: number;
    totalGMV: number;
    fulfillmentRate: number;
    avgPlatformRating: number;
  };
  counters: {
    totalRequests: number;
    pendingRequests: number;
    openComplaints: number;
    totalUsers: number;
    vendorsCount: number;
    clientsCount: number;
  };
  today: { requests: number; commission: number };
  topCategories: { name: string; requestCount: number }[];
  trends: { day: string; requests: number; revenue: number }[];
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  createdAt: string;
  user?: { fullName: string };
}

interface Vendor {
  id: number;
  fullName: string;
  walletBalance: number;
  isVerified: boolean;
}

/* ─── Donut Chart ─── */
const DONUT_PALETTE: Record<string, string> = {
  WALLET_TOPUP:     '#fbbf24',
  ESCROW_DEPOSIT:   '#60a5fa',
  WITHDRAWAL:       '#fb7185',
  REFUND:           '#34d399',
  ADMIN_COMMISSION: '#a78bfa',
  VENDOR_PAYMENT:   '#94a3b8',
  PLATFORM_FEE:     '#a78bfa',
};

const TX_LABELS: Record<string, string> = {
  WALLET_TOPUP:     'شحن محفظة',
  ESCROW_DEPOSIT:   'إيداع ضمان',
  WITHDRAWAL:       'سحب',
  REFUND:           'استرداد',
  ADMIN_COMMISSION: 'عمولة المنصة',
  VENDOR_PAYMENT:   'دفع للتاجر',
  PLATFORM_FEE:     'رسوم المنصة',
};

function DonutChart({ segments }: { segments: { type: string; count: number }[] }) {
  const R = 40;
  const C = 2 * Math.PI * R;
  const total = segments.reduce((s, seg) => s + seg.count, 0) || 1;

  let accumulated = 0;
  const arcs = segments.map(seg => {
    const portion = seg.count / total;
    const dash = portion * C;
    const startAngle = -90 + (accumulated / total) * 360;
    accumulated += seg.count;
    return { ...seg, dash, gap: C - dash, startAngle };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg viewBox="0 0 100 100" className="w-36 h-36 shrink-0">
        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx="50" cy="50" r={R}
            fill="none"
            stroke={DONUT_PALETTE[arc.type] ?? '#cbd5e1'}
            strokeWidth="20"
            strokeDasharray={`${arc.dash.toFixed(1)} ${arc.gap.toFixed(1)}`}
            strokeDashoffset="0"
            transform={`rotate(${arc.startAngle} 50 50)`}
            strokeLinecap="butt"
          />
        ))}
        <circle cx="50" cy="50" r="28" fill="white" />
        <text x="50" y="47" textAnchor="middle" fontSize="11" fill="#1e293b" fontWeight="bold">{total}</text>
        <text x="50" y="57" textAnchor="middle" fontSize="7" fill="#94a3b8">معاملة</text>
      </svg>
      <div className="flex flex-col gap-2 flex-1 w-full">
        {arcs.map((arc, i) => {
          const pct = Math.round((arc.count / total) * 100);
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: DONUT_PALETTE[arc.type] ?? '#cbd5e1' }} />
              <span className="text-xs text-slate-600 flex-1 truncate">{TX_LABELS[arc.type] ?? arc.type}</span>
              <span className="text-xs font-bold text-slate-700">{arc.count}</span>
              <span className="text-[10px] text-slate-400 w-8 text-left">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Bar Chart (larger) ─── */
function BarChart({ trends }: { trends: AnalyticsData['trends'] }) {
  const maxR = Math.max(...trends.map(t => t.requests), 1);
  const days: Record<string, string> = { Mon: 'الإثنين', Tue: 'الثلاثاء', Wed: 'الأربعاء', Thu: 'الخميس', Fri: 'الجمعة', Sat: 'السبت', Sun: 'الأحد' };
  return (
    <div className="flex items-end gap-3 h-44 justify-between" dir="ltr">
      {trends.map((t, i) => {
        const pct = (t.requests / maxR) * 100;
        const isLast = i === trends.length - 1;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">{t.requests}</span>
            <div className="w-full rounded-t-lg transition-all" style={{
              height: `${Math.max(pct, 5)}%`,
              background: isLast ? '#f97316' : '#e2e8f0',
            }} />
            <span className="text-[10px] text-slate-400 text-center leading-tight">{days[t.day] ?? t.day}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Counter Tile ─── */
function CounterTile({ label, value, icon, iconColor, iconBg }: {
  label: string; value: string | number;
  icon: React.ReactNode; iconColor: string; iconBg: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-5 bg-white rounded-2xl border border-slate-200/80 text-center gap-2">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
    </div>
  );
}

/* ─── Main Page ─── */
export default function AnalyticsPage() {
  const { data: analytics, loading: aL } = useAsyncData<AnalyticsData>(
    () => apiFetch('/api/admin/analytics/overview', 'ADMIN'), []
  );
  const { data: txsRaw, loading: tL } = useAsyncData<Transaction[]>(
    () => apiFetch('/api/admin/finance/transactions?limit=200', 'ADMIN'), []
  );
  const { data: vendorsRaw, loading: vL } = useAsyncData<Vendor[]>(
    () => apiFetch('/api/admin/vendors?limit=200', 'ADMIN'), []
  );

  const txSegments = useMemo(() => {
    const txs: Transaction[] = Array.isArray(txsRaw) ? txsRaw : [];
    const counts: Record<string, number> = {};
    txs.forEach(tx => { counts[tx.type] = (counts[tx.type] ?? 0) + 1; });
    return Object.entries(counts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }, [txsRaw]);

  const topVendors = useMemo(() => {
    const list: Vendor[] = vendorsRaw ?? [];
    return [...list].sort((a, b) => Number(b.walletBalance) - Number(a.walletBalance)).slice(0, 5);
  }, [vendorsRaw]);

  const maxBal = topVendors.length > 0 ? Number(topVendors[0].walletBalance) : 1;

  const BAR_COLORS = ['#f97316', '#60a5fa', '#a78bfa', '#34d399', '#fbbf24'];

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">التحليلات</h1>
          <p className="text-sm text-slate-400 mt-0.5">نظرة شاملة على أداء المنصة</p>
        </div>
        <Link href="/admin/finance"
          className="flex items-center gap-1.5 text-sm font-semibold text-primary bg-primary/10 px-4 py-2 rounded-xl hover:bg-primary/20 transition-colors">
          التقارير المالية <FiArrowUpRight size={15} />
        </Link>
      </div>

      {/* Row 1: Bar Chart + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* 7-Day Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <FiBarChart2 size={16} className="text-primary" /> طلبات آخر 7 أيام
            </h3>
            <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-lg">عدد الطلبات</span>
          </div>
          {aL ? (
            <div className="h-44 flex items-center justify-center text-slate-300">
              <FiRefreshCw size={22} className="animate-spin" />
            </div>
          ) : analytics?.trends ? (
            <BarChart trends={analytics.trends} />
          ) : (
            <div className="h-44 flex items-center justify-center text-slate-400 text-sm">لا توجد بيانات</div>
          )}
        </div>

        {/* Transaction Donut */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-5">
            <FiDollarSign size={16} className="text-primary" /> توزيع أنواع المعاملات
          </h3>
          {tL ? (
            <div className="h-44 flex items-center justify-center text-slate-300">
              <FiRefreshCw size={22} className="animate-spin" />
            </div>
          ) : txSegments.length > 0 ? (
            <DonutChart segments={txSegments} />
          ) : (
            <div className="h-44 flex items-center justify-center text-slate-400 text-sm">لا توجد معاملات</div>
          )}
        </div>
      </div>

      {/* Row 2: Top Vendors + Counters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Top 5 Vendors */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <FiTrendingUp size={16} className="text-primary" /> أعلى التجار رصيداً
            </h3>
            <Link href="/admin/vendors" className="text-xs font-semibold text-primary hover:text-orange-600 flex items-center gap-1">
              عرض الكل <FiArrowUpRight size={12} />
            </Link>
          </div>
          {vL ? (
            <div className="py-10 flex items-center justify-center text-slate-300">
              <FiRefreshCw size={22} className="animate-spin" />
            </div>
          ) : topVendors.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm">لا توجد بيانات</div>
          ) : (
            <div className="space-y-4">
              {topVendors.map((v, i) => {
                const pct = Math.round((Number(v.walletBalance) / maxBal) * 100);
                return (
                  <div key={v.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                        <span className="text-sm font-semibold text-slate-800 truncate max-w-[160px]">{v.fullName}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-700" dir="ltr">{formatCurrency(Number(v.walletBalance))}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: BAR_COLORS[i], transition: 'width 0.8s ease' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Platform Counters */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-5">
            <FiPackage size={16} className="text-primary" /> ملخص المنصة
          </h3>
          {aL ? (
            <div className="py-10 flex items-center justify-center text-slate-300">
              <FiRefreshCw size={22} className="animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <CounterTile
                label="إجمالي الطلبات"
                value={analytics?.counters.totalRequests ?? '—'}
                icon={<FiPackage size={18} className="text-orange-600" />}
                iconColor="text-orange-600"
                iconBg="bg-orange-50"
              />
              <CounterTile
                label="إجمالي المستخدمين"
                value={analytics?.counters.totalUsers ?? '—'}
                icon={<FiUsers size={18} className="text-blue-600" />}
                iconColor="text-blue-600"
                iconBg="bg-blue-50"
              />
              <CounterTile
                label="معدل الإتمام"
                value={analytics?.overview.fulfillmentRate != null
                  ? `${Math.round(analytics.overview.fulfillmentRate)}%`
                  : '—'}
                icon={<FiCheckCircle size={18} className="text-emerald-600" />}
                iconColor="text-emerald-600"
                iconBg="bg-emerald-50"
              />
              <CounterTile
                label="متوسط التقييم"
                value={analytics?.overview.avgPlatformRating
                  ? `${Number(analytics.overview.avgPlatformRating).toFixed(1)} / 5`
                  : '—'}
                icon={<FiStar size={18} className="text-amber-500" />}
                iconColor="text-amber-500"
                iconBg="bg-amber-50"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
