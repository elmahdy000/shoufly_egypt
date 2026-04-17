"use client";

import Link from "next/link";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  Activity, ArrowUpRight, Users, Package,
  CreditCard, TrendingUp, ChevronLeft,
  Clock, CheckCircle2, AlertCircle, Circle,
} from "lucide-react";

interface RecentRequest {
  id: number;
  title: string;
  status?: string;
  createdAt: string;
  client?: { fullName?: string | null } | null;
}

interface DashboardStats {
  totalUsers: number;
  openRequests: number;
  totalVendors: number;
  todayRequests: number;
  totalGMV: number;
  recentRequests: RecentRequest[];
}

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  PENDING_ADMIN_REVISION:      { label: "قيد المراجعة",       cls: "bg-amber-50 text-amber-700",  icon: Clock },
  OPEN_FOR_BIDDING:            { label: "مفتوح للعروض",       cls: "bg-blue-50 text-blue-700",    icon: Activity },
  BIDS_RECEIVED:               { label: "عروض واردة",         cls: "bg-purple-50 text-purple-700",icon: Activity },
  OFFERS_FORWARDED:            { label: "عروض محولة",         cls: "bg-indigo-50 text-indigo-700",icon: ArrowUpRight },
  ORDER_PAID_PENDING_DELIVERY: { label: "مدفوع - ينتظر التوصيل", cls: "bg-orange-50 text-orange-700", icon: Circle },
  CLOSED_SUCCESS:              { label: "مكتمل",              cls: "bg-green-50 text-green-700",  icon: CheckCircle2 },
  CLOSED_CANCELLED:            { label: "ملغى",               cls: "bg-red-50 text-red-600",      icon: AlertCircle },
  REJECTED:                    { label: "مرفوض",              cls: "bg-gray-100 text-gray-500",   icon: AlertCircle },
};

function StatusPill({ status }: { status?: string }) {
  const cfg = STATUS_CONFIG[status ?? ""] ?? { label: status ?? "—", cls: "bg-gray-100 text-gray-500", icon: Circle };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${cfg.cls}`}>
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

function KpiCard({
  title, value, delta, deltaLabel, icon: Icon, loading,
}: {
  title: string; value: string | number; delta?: string; deltaLabel?: string;
  icon: React.ElementType; loading?: boolean;
}) {
  return (
    <div className="rounded-2xl p-4 sm:p-5 lg:p-6 bg-white border border-gray-200 text-gray-900 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4 lg:mb-5">
        <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-13 lg:h-13 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
          <Icon size={18} className="text-orange-700 sm:hidden" strokeWidth={2} />
          <Icon size={20} className="text-orange-700 hidden sm:block lg:hidden" strokeWidth={2} />
          <Icon size={22} className="text-orange-700 hidden lg:block" strokeWidth={2} />
        </div>
        {delta && (
          <span className="flex items-center gap-1.5 text-xs sm:text-sm font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-200 shrink-0 whitespace-nowrap">
            <TrendingUp size={12} className="sm:hidden" strokeWidth={2} />
            <TrendingUp size={14} className="hidden sm:block" strokeWidth={2} />
            {delta}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-none text-gray-900 mb-2 tabular-nums">
          {loading ? <span className="inline-block w-24 sm:w-32 h-7 sm:h-8 lg:h-9 rounded-lg animate-pulse bg-gray-200" /> : value}
        </p>
        <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{title}</p>
        {deltaLabel && <p className="text-xs text-gray-500">{deltaLabel}</p>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data: stats, loading } = useAsyncData<DashboardStats>(
    () => apiFetch("/api/admin/stats", "ADMIN"),
    []
  );

  const gmv = loading ? "—" : formatCurrency(stats?.totalGMV ?? 0).split(".")[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 min-h-screen" dir="rtl">

      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">نظرة عامة على أداء المنصة اليوم</p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          النظام يعمل
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4">
        <KpiCard title="إجمالي المبيعات"    value={gmv}                                              delta="+12.5%" deltaLabel="مقارنة بالشهر الماضي"  icon={CreditCard} loading={loading} />
        <KpiCard title="الطلبات المفتوحة"   value={stats?.openRequests   ?? 0}                       delta={undefined}                                   icon={Package}                loading={loading} />
        <KpiCard title="طلبات اليوم"        value={stats?.todayRequests  ?? 0}                       delta={undefined}                                   icon={Activity}               loading={loading} />
        <KpiCard title="المستخدمين"         value={(stats?.totalUsers    ?? 0).toLocaleString("ar-EG")} deltaLabel={`${stats?.totalVendors ?? 0} مورد`}  icon={Users}                  loading={loading} />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">

        {/* Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100">
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-gray-900">أحدث الطلبات</h2>
              <p className="text-xs text-gray-400 mt-0.5">آخر العمليات على المنصة</p>
            </div>
            <Link href="/admin/requests" className="inline-flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors shrink-0">
              عرض الكل <ChevronLeft size={13} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-3 sm:px-5 py-3 text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/60 whitespace-nowrap">الطلب</th>
                  <th className="hidden sm:table-cell px-3 sm:px-5 py-3 text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/60 whitespace-nowrap">العميل</th>
                  <th className="px-3 sm:px-5 py-3 text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/60 whitespace-nowrap">الحالة</th>
                  <th className="hidden md:table-cell px-3 sm:px-5 py-3 text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/60 whitespace-nowrap">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td colSpan={4} className="px-3 sm:px-5 py-3">
                          <div className="h-4 bg-gray-100 rounded-md animate-pulse" style={{ width: `${60 + i * 7}%` }} />
                        </td>
                      </tr>
                    ))
                  : (stats?.recentRequests?.length ?? 0) === 0
                    ? (
                      <tr>
                        <td colSpan={4} className="px-3 sm:px-5 py-8 sm:py-14 text-center text-xs sm:text-sm text-gray-400">
                          لا توجد طلبات حالياً
                        </td>
                      </tr>
                    )
                    : stats!.recentRequests.slice(0, 8).map((req) => (
                        <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors group">
                          <td className="px-3 sm:px-5 py-2.5 sm:py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                                <Package size={12} className="text-orange-500" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[12px] sm:text-[13px] font-semibold text-gray-900 leading-none line-clamp-1">{req.title}</p>
                                <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5">#{req.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="hidden sm:table-cell px-3 sm:px-5 py-2.5 sm:py-3.5 text-[12px] sm:text-[13px] text-gray-600">{req.client?.fullName ?? "—"}</td>
                          <td className="px-3 sm:px-5 py-2.5 sm:py-3.5"><StatusPill status={req.status} /></td>
                          <td className="hidden md:table-cell px-3 sm:px-5 py-2.5 sm:py-3.5 text-[10px] sm:text-[11px] text-gray-400 whitespace-nowrap">{formatDate(req.createdAt)}</td>
                        </tr>
                      ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-3 sm:space-y-4">

          {/* GMV highlight */}
          <div className="bg-gray-900 rounded-xl p-4 sm:p-5 text-white">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wide">إجمالي المبيعات</p>
              <TrendingUp size={14} className="text-orange-400" />
            </div>
            <p className="text-3xl font-bold text-white tracking-tight">{gmv}</p>
            <p className="text-xs text-gray-500 mt-1">القيمة الإجمالية للمعاملات</p>
            <div className="mt-4">
              <div className="flex justify-between text-[11px] text-gray-500 mb-1.5">
                <span>الهدف الشهري</span>
                <span className="text-orange-400 font-semibold">72%</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: "72%" }} />
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-900 mb-2 sm:mb-3">ملخص النظام</p>
            <div className="space-y-1 sm:space-y-2">
              {[
                { label: "الموردين النشطين",    value: stats?.totalVendors   ?? 0, color: "bg-orange-500" },
                { label: "إجمالي المستخدمين",   value: stats?.totalUsers     ?? 0, color: "bg-blue-500"   },
                { label: "طلبات اليوم",         value: stats?.todayRequests  ?? 0, color: "bg-green-500"  },
                { label: "الطلبات المفتوحة",    value: stats?.openRequests   ?? 0, color: "bg-amber-500"  },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${item.color}`} />
                    <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">{item.label}</span>
                  </div>
                  <span className="text-base sm:text-lg font-bold text-gray-900 tabular-nums ml-2 shrink-0">
                    {loading ? "—" : item.value.toLocaleString("ar-EG")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-900 mb-2 sm:mb-3">روابط سريعة</p>
            <div className="space-y-0.5">
              {[
                { label: "إدارة المستخدمين",   href: "/admin/users",        icon: Users       },
                { label: "الطلبات المفتوحة",   href: "/admin/requests",     icon: Package     },
                { label: "التقارير المالية",    href: "/admin/finance",      icon: CreditCard  },
                { label: "تتبع التوصيل",       href: "/admin/tracking",     icon: Activity    },
              ].map(link => {
                const Icon = link.icon;
                return (
                  <Link key={link.href} href={link.href} className="flex items-center gap-2 sm:gap-2.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-orange-50 group transition-colors">
                    <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-md bg-gray-100 group-hover:bg-orange-500 flex items-center justify-center transition-colors shrink-0">
                      <Icon size={12} className="text-gray-500 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-[12px] sm:text-[13px] font-medium text-gray-700 group-hover:text-orange-600 flex-1 min-w-0 truncate transition-colors">{link.label}</span>
                    <ChevronLeft size={12} className="text-gray-300 group-hover:text-orange-400 transition-colors shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
