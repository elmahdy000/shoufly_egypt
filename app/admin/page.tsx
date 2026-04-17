"use client";

import Link from "next/link";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Package,
  CreditCard,
  ChevronLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
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

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  trend,
  trendUp,
  accent = false,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-6 flex flex-col gap-4 transition-shadow hover:shadow-md ${
        accent
          ? "bg-orange-500 text-white"
          : "bg-white border border-gray-200 text-gray-900"
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            accent ? "bg-white/20" : "bg-orange-50"
          }`}
        >
          <Icon
            size={20}
            className={accent ? "text-white" : "text-orange-500"}
          />
        </div>
        {trend && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
              trendUp
                ? accent
                  ? "bg-white/20 text-white"
                  : "bg-green-50 text-green-600"
                : accent
                ? "bg-white/20 text-white"
                : "bg-red-50 text-red-500"
            }`}
          >
            {trendUp ? (
              <ArrowUpRight size={12} />
            ) : (
              <ArrowDownRight size={12} />
            )}
            {trend}
          </span>
        )}
      </div>
      <div>
        <p
          className={`text-3xl font-bold tracking-tight ${
            accent ? "text-white" : "text-gray-900"
          }`}
        >
          {value}
        </p>
        <p
          className={`text-sm mt-1 font-medium ${
            accent ? "text-white/80" : "text-gray-500"
          }`}
        >
          {title}
        </p>
        {sub && (
          <p
            className={`text-xs mt-0.5 ${
              accent ? "text-white/60" : "text-gray-400"
            }`}
          >
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const s = status?.toLowerCase() ?? "";
  if (s.includes("complet") || s.includes("تم"))
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
        <CheckCircle2 size={11} /> مكتمل
      </span>
    );
  if (s.includes("pending") || s.includes("انتظار"))
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
        <Clock size={11} /> انتظار
      </span>
    );
  if (s.includes("cancel") || s.includes("ملغ"))
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold">
        <AlertCircle size={11} /> ملغي
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
      <Activity size={11} /> {status ?? "جاري"}
    </span>
  );
}

export default function AdminDashboard() {
  const { data: stats, loading } = useAsyncData<DashboardStats>(
    () => apiFetch("/api/admin/stats", "ADMIN"),
    []
  );

  const gmv = formatCurrency(stats?.totalGMV ?? 0).split(".")[0];

  return (
    <div className="p-8 space-y-8 min-h-screen bg-gray-50" dir="rtl">

      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="text-sm text-gray-500 mt-0.5">نظرة عامة على أداء المنصة</p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 text-xs font-semibold px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          النظام يعمل بكفاءة
        </span>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="إجمالي المبيعات"
          value={loading ? "—" : gmv}
          sub="القيمة الإجمالية للمعاملات"
          icon={CreditCard}
          trend="12.5%"
          trendUp
          accent
        />
        <StatCard
          title="الطلبات المفتوحة"
          value={loading ? "—" : (stats?.openRequests ?? 0)}
          sub="طلبات تحتاج مراجعة"
          icon={Package}
          trend={`${stats?.openRequests ?? 0} طلب`}
          trendUp={false}
        />
        <StatCard
          title="طلبات اليوم"
          value={loading ? "—" : (stats?.todayRequests ?? 0)}
          sub="طلبات منذ منتصف الليل"
          icon={Activity}
          trend="اليوم"
          trendUp
        />
        <StatCard
          title="إجمالي المستخدمين"
          value={loading ? "—" : (stats?.totalUsers ?? 0).toLocaleString("ar-EG")}
          sub={`${stats?.totalVendors ?? 0} مورد نشط`}
          icon={Users}
          trend="24 هذا الشهر"
          trendUp
        />
      </div>

      {/* Content: Table + Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent Requests Table */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900">أحدث الطلبات</h2>
              <p className="text-xs text-gray-400 mt-0.5">آخر العمليات المسجلة</p>
            </div>
            <Link
              href="/admin/requests"
              className="inline-flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
            >
              عرض الكل
              <ChevronLeft size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3.5 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    الطلب
                  </th>
                  <th className="px-6 py-3.5 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    العميل
                  </th>
                  <th className="px-6 py-3.5 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3.5 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    التاريخ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="px-6 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : (stats?.recentRequests?.length ?? 0) === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-16 text-center text-sm text-gray-400"
                    >
                      لا توجد طلبات حالياً
                    </td>
                  </tr>
                ) : (
                  stats!.recentRequests.slice(0, 7).map((req) => (
                    <tr
                      key={req.id}
                      className="hover:bg-gray-50/70 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                            <Package size={14} className="text-orange-500" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 leading-none">
                              {req.title}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              #{req.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {req.client?.fullName || "عميل"}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400">
                        {formatDate(req.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar: Stats + Links */}
        <div className="space-y-5">

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 mb-2">ملخص سريع</h3>
            {[
              {
                label: "الموردين النشطين",
                value: stats?.totalVendors ?? 0,
                color: "bg-orange-500",
              },
              {
                label: "المستخدمين المسجلين",
                value: stats?.totalUsers ?? 0,
                color: "bg-blue-500",
              },
              {
                label: "طلبات اليوم",
                value: stats?.todayRequests ?? 0,
                color: "bg-green-500",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-2 h-2 rounded-full ${item.color}`}
                  />
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {loading ? "—" : item.value.toLocaleString("ar-EG")}
                </span>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">روابط سريعة</h3>
            <div className="space-y-2">
              {[
                { label: "إدارة المستخدمين", href: "/admin/users", icon: Users },
                { label: "الطلبات المفتوحة", href: "/admin/requests", icon: Package },
                { label: "التقارير المالية", href: "/admin/finance", icon: CreditCard },
                { label: "تتبع التوصيل", href: "/admin/tracking", icon: Activity },
              ].map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 group transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-orange-500 flex items-center justify-center transition-colors">
                      <Icon
                        size={15}
                        className="text-gray-500 group-hover:text-white transition-colors"
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600 transition-colors flex-1">
                      {link.label}
                    </span>
                    <ChevronLeft
                      size={14}
                      className="text-gray-300 group-hover:text-orange-400 transition-colors"
                    />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* GMV Card */}
          <div className="bg-gray-900 rounded-2xl p-6 text-white">
            <div className="flex items-start justify-between mb-4">
              <p className="text-xs text-gray-400 font-medium">إجمالي المبيعات</p>
              <TrendingUp size={16} className="text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-white">{loading ? "—" : gmv}</p>
            <p className="text-xs text-gray-500 mt-1">قيمة إجمالية للمعاملات</p>
            <div className="mt-4 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full"
                style={{ width: "72%" }}
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5">72% من الهدف الشهري</p>
          </div>
        </div>
      </div>
    </div>
  );
}
