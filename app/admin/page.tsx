"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useAsyncData } from '@/lib/hooks/use-async-data';
import { apiFetch } from '@/lib/api/client';
import { formatCurrency } from '@/lib/formatters';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  FiTrendingUp, FiTrendingDown, FiUsers, FiPackage, FiDollarSign,
  FiStar, FiAlertCircle, FiArrowUpRight, FiCreditCard, FiActivity,
  FiShoppingBag, FiCheckCircle, FiClock, FiBarChart2, FiZap,
  FiRefreshCw
} from 'react-icons/fi';

/* ─────────────────── Types ─────────────────── */
interface PlatformStats {
  totalUsers: number;
  totalVendors: number;
  openRequests: number;
  totalTransactions: number;
  pendingWithdrawals: number;
  revenue: number;
  liquidity: number;
  growthRate: number;
}

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
  description?: string;
}

/* ─────────────────── Mini SVG Sparkline ─────────────────── */
function Sparkline({ values, color = '#f97316' }: { values: number[]; color?: string }) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 120; const h = 36; const points = values.length;
  const coords = values.map((v, i) => [
    (i / (points - 1)) * w,
    h - ((v - min) / range) * h * 0.85 - h * 0.075,
  ]);
  const d = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const fill = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
    + ` L${w} ${h} L0 ${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <path d={fill} fill={color} fillOpacity="0.12" />
      <path d={d} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─────────────────── Bar Chart ─────────────────── */
function TrendChart({ trends }: { trends: AnalyticsData['trends'] }) {
  const maxR = Math.max(...trends.map(t => t.requests), 1);
  const days: Record<string, string> = { Mon: 'الإث', Tue: 'الث', Wed: 'الأر', Thu: 'الخم', Fri: 'الج', Sat: 'الس', Sun: 'الأح' };
  return (
    <div className="flex items-end gap-2 h-28 justify-between" dir="ltr">
      {trends.map((t, i) => {
        const pct = (t.requests / maxR) * 100;
        const isLast = i === trends.length - 1;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <span className="text-[10px] text-slate-500 font-medium">{t.requests}</span>
            <div className="w-full rounded-t-md transition-all" style={{
              height: `${Math.max(pct, 8)}%`,
              background: isLast ? 'linear-gradient(to top, #f97316, #fb923c)' : '#e2e8f0',
              boxShadow: isLast ? '0 4px 12px rgba(249,115,22,0.3)' : 'none',
            }} />
            <span className="text-[9px] text-slate-400">{days[t.day] ?? t.day}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────── KPI Card ─────────────────── */
interface KpiProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  iconBg: string;
  trend?: number;
  href?: string;
  sparkline?: number[];
  sparkColor?: string;
}
function KpiCard({ label, value, sub, icon, iconBg, trend, href, sparkline, sparkColor }: KpiProps) {
  const up = (trend ?? 0) >= 0;
  const content = (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between gap-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
          {sub && <p className="text-[11px] text-slate-400 mt-1 font-medium">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-center justify-between">
        {trend !== undefined ? (
          <div className={`flex items-center gap-1 text-xs font-semibold ${up ? 'text-emerald-600' : 'text-rose-500'}`}>
            {up ? <FiTrendingUp size={13} /> : <FiTrendingDown size={13} />}
            <span>{up ? '+' : ''}{trend}%</span>
          </div>
        ) : <div />}
        {sparkline && <Sparkline values={sparkline} color={sparkColor} />}
      </div>
    </div>
  );
  return href ? <Link href={href} className="block h-full">{content}</Link> : content;
}

/* ─────────────────── Tx Type Label ─────────────────── */
function txLabel(type: string) {
  const map: Record<string, { ar: string; color: string; bg: string }> = {
    ADMIN_COMMISSION: { ar: 'عمولة المنصة', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ESCROW_DEPOSIT: { ar: 'إيداع ضمان', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    VENDOR_PAYMENT: { ar: 'دفع للتاجر', color: 'text-blue-600', bg: 'bg-blue-50' },
    WALLET_TOPUP: { ar: 'شحن محفظة', color: 'text-violet-600', bg: 'bg-violet-50' },
    WITHDRAWAL: { ar: 'سحب', color: 'text-rose-600', bg: 'bg-rose-50' },
    REFUND: { ar: 'استرداد', color: 'text-amber-600', bg: 'bg-amber-50' },
  };
  return map[type] ?? { ar: type.replace(/_/g, ' '), color: 'text-slate-600', bg: 'bg-slate-100' };
}

/* ─────────────────── Status Badge ─────────────────── */
function StatusPill({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border ${color}`}>
      <span className="text-sm font-medium">{label}</span>
      <span className="text-lg font-bold">{count}</span>
    </div>
  );
}

/* ─────────────────── Main Page ─────────────────── */
export default function AdminDashboard() {
  const { data: stats, loading: sL } = useAsyncData<PlatformStats>(() => apiFetch('/api/admin/stats', 'ADMIN'), []);
  const { data: analytics, loading: aL } = useAsyncData<AnalyticsData>(() => apiFetch('/api/admin/analytics/overview', 'ADMIN'), []);
  const { data: txs, loading: tL } = useAsyncData<Transaction[]>(() => apiFetch('/api/admin/finance/transactions', 'ADMIN'), []);

  const loading = sL || aL;

  const sparkRevenue = useMemo(
    () => analytics?.trends.map(t => t.revenue) ?? [0],
    [analytics]
  );
  const sparkRequests = useMemo(
    () => analytics?.trends.map(t => t.requests) ?? [0],
    [analytics]
  );

  const today = new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6 text-right" dir="rtl">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">لوحة التحكم</h1>
          <p className="text-sm text-slate-400 mt-0.5">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs font-bold">
            <FiZap size={13} /> اليوم: {analytics?.today.requests ?? 0} طلب جديد
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-bold">
            <FiActivity size={13} /> عمولة اليوم: {formatCurrency(analytics?.today.commission ?? 0)}
          </div>
        </div>
      </div>

      {/* ── Hero Revenue Card + 4 KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Hero */}
        <div className="col-span-2 bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl shadow-slate-900/20">
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-slate-400 text-xs font-medium mb-2">إجمالي إيرادات المنصة</p>
                <p className="text-4xl font-bold tracking-tight">
                  {loading ? '—' : formatCurrency(stats?.revenue ?? 0).split(' ')[0]}
                  <span className="text-base text-slate-400 font-medium mr-1">ج.م</span>
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/40">
                <FiDollarSign size={22} />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <FiTrendingUp size={13} /> +{stats?.growthRate ?? 0}% هذا الشهر
                </div>
                <p className="text-xs text-slate-500">
                  السيولة الكلية: <span className="text-slate-300 font-semibold">{loading ? '—' : formatCurrency(stats?.liquidity ?? 0)}</span>
                </p>
              </div>
              <Link href="/admin/finance" className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-orange-400 transition-colors bg-primary/10 hover:bg-primary/20 px-3 py-2 rounded-xl">
                التقارير <FiArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* GMV */}
        <KpiCard
          label="إجمالي حجم المعاملات (GMV)"
          value={loading ? '—' : formatCurrency(analytics?.overview.totalGMV ?? 0).split(' ')[0] + ' ج.م'}
          sub="مجموع الأموال المحركة"
          icon={<FiShoppingBag size={18} className="text-violet-600" />}
          iconBg="bg-violet-50"
          sparkline={sparkRevenue}
          sparkColor="#7c3aed"
        />

        {/* Users */}
        <KpiCard
          label="إجمالي المستخدمين"
          value={loading ? '—' : stats?.totalUsers ?? 0}
          sub={`${analytics?.counters.vendorsCount ?? 0} تاجر · ${analytics?.counters.clientsCount ?? 0} عميل`}
          icon={<FiUsers size={18} className="text-blue-600" />}
          iconBg="bg-blue-50"
          href="/admin/users"
          sparkline={sparkRequests}
          sparkColor="#2563eb"
        />
      </div>

      {/* ── Second Row: Metrics ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          label="معدل إتمام الطلبات"
          value={`${analytics?.overview.fulfillmentRate ?? 0}%`}
          sub="نسبة الطلبات المكتملة"
          icon={<FiCheckCircle size={18} className="text-emerald-600" />}
          iconBg="bg-emerald-50"
          trend={2.4}
        />
        <KpiCard
          label="تقييم المنصة"
          value={analytics?.overview.avgPlatformRating ? `${analytics.overview.avgPlatformRating} / 5` : '—'}
          sub="متوسط تقييم المستخدمين"
          icon={<FiStar size={18} className="text-amber-500" />}
          iconBg="bg-amber-50"
        />
        <KpiCard
          label="طلبات قيد المراجعة"
          value={loading ? '—' : stats?.openRequests ?? 0}
          sub="بانتظار قرار الأدمن"
          icon={<FiClock size={18} className="text-orange-500" />}
          iconBg="bg-orange-50"
          href="/admin/requests"
        />
        <KpiCard
          label="سحوبات معلقة"
          value={loading ? '—' : stats?.pendingWithdrawals ?? 0}
          sub="بانتظار الموافقة"
          icon={<FiCreditCard size={18} className="text-rose-500" />}
          iconBg="bg-rose-50"
          href="/admin/withdrawals"
        />
      </div>

      {/* ── Main Content: Chart + Categories + Transactions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left: Transactions Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <FiBarChart2 size={16} className="text-primary" /> أحدث المعاملات المالية
            </h3>
            <Link href="/admin/finance" className="text-xs font-semibold text-primary hover:text-orange-600 flex items-center gap-1">
              عرض الكل <FiArrowUpRight size={13} />
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400 font-medium">النوع</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400 font-medium">القيمة</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400 font-medium hidden sm:table-cell">المستخدم</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400 text-center font-medium">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tL ? (
                  <tr><td colSpan={4} className="py-10 text-center text-slate-400 text-sm">
                    <FiRefreshCw size={20} className="animate-spin mx-auto mb-2 text-slate-300" />
                    جاري التحميل...
                  </td></tr>
                ) : !txs || txs.length === 0 ? (
                  <tr><td colSpan={4} className="py-10 text-center text-slate-400 text-sm">لا توجد معاملات</td></tr>
                ) : txs.slice(0, 8).map(tx => {
                  const meta = txLabel(tx.type);
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0 ${meta.bg}`}>
                            <FiCreditCard size={15} className={meta.color} />
                          </div>
                          <div>
                            <p className={`text-xs font-semibold ${meta.color}`}>{meta.ar}</p>
                            <p className="text-[10px] text-slate-400">#{tx.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900" dir="ltr">{formatCurrency(tx.amount)}</p>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <p className="text-slate-600 font-medium text-xs">{tx.user?.fullName ?? '—'}</p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <p className="text-[10px] text-slate-400 font-medium">
                          {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true, locale: ar })}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Charts + Quick Status */}
        <div className="flex flex-col gap-5">
          {/* 7-Day Trend */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FiActivity size={15} className="text-primary" /> نشاط آخر 7 أيام
              </h3>
              <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-1 rounded-lg">عدد الطلبات</span>
            </div>
            {analytics?.trends ? (
              <TrendChart trends={analytics.trends} />
            ) : (
              <div className="h-28 flex items-center justify-center text-slate-300">
                <FiRefreshCw size={20} className="animate-spin" />
              </div>
            )}
          </div>

          {/* Top Categories */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex-1">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-4">
              <FiBarChart2 size={15} className="text-primary" /> أعلى التصنيفات طلباً
            </h3>
            {analytics?.topCategories?.length ? (
              <div className="space-y-3">
                {analytics.topCategories.slice(0, 5).map((cat, i) => {
                  const max = analytics.topCategories[0].requestCount || 1;
                  const pct = Math.round((cat.requestCount / max) * 100);
                  const colors = ['bg-primary', 'bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500'];
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-slate-700">{cat.name}</span>
                        <span className="text-slate-400">{cat.requestCount}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${colors[i]}`} style={{ width: `${pct}%`, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-300 text-sm">جاري التحميل...</div>
            )}
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FiActivity size={15} className="text-primary" /> آخر الأحداث
              </h3>
              <Link href="/admin/finance" className="text-[11px] font-semibold text-primary hover:text-orange-600 flex items-center gap-1">
                عرض الكل <FiArrowUpRight size={11} />
              </Link>
            </div>
            {tL ? (
              <div className="py-6 flex items-center justify-center text-slate-300">
                <FiRefreshCw size={18} className="animate-spin" />
              </div>
            ) : !txs || txs.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">لا توجد أحداث</div>
            ) : (
              <div className="space-y-3">
                {txs.slice(0, 6).map(tx => {
                  const meta = txLabel(tx.type);
                  const dotColors: Record<string, string> = {
                    ADMIN_COMMISSION: 'bg-indigo-400',
                    ESCROW_DEPOSIT: 'bg-emerald-400',
                    VENDOR_PAYMENT: 'bg-blue-400',
                    WALLET_TOPUP: 'bg-violet-400',
                    WITHDRAWAL: 'bg-rose-400',
                    REFUND: 'bg-amber-400',
                  };
                  return (
                    <div key={tx.id} className="flex items-start gap-3">
                      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotColors[tx.type] ?? 'bg-slate-300'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${meta.color}`}>{meta.ar}</p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {tx.user?.fullName ?? '—'} · {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true, locale: ar })}
                        </p>
                      </div>
                      <p className="text-xs font-bold text-slate-800 shrink-0" dir="ltr">{formatCurrency(tx.amount)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'مراجعة الطلبات', href: '/admin/requests', icon: FiPackage, color: 'text-orange-600 bg-orange-50 border-orange-100' },
          { label: 'إدارة المستخدمين', href: '/admin/users', icon: FiUsers, color: 'text-blue-600 bg-blue-50 border-blue-100' },
          { label: 'السحوبات المعلقة', href: '/admin/withdrawals', icon: FiCreditCard, color: 'text-violet-600 bg-violet-50 border-violet-100' },
          { label: 'الشكاوى والنزاعات', href: '/admin/refunds', icon: FiAlertCircle, color: 'text-rose-600 bg-rose-50 border-rose-100' },
        ].map(a => (
          <Link key={a.href} href={a.href}
            className={`flex items-center gap-3 p-4 rounded-2xl border font-semibold text-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${a.color}`}
          >
            <a.icon size={18} /> {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
