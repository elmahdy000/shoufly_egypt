"use client";

import Link from "next/link";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  BarChart3,
  Users,
  Package,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface RecentRequest {
  id: number;
  title: string;
  createdAt: string;
  status: string;
  client?: { fullName?: string | null } | null;
}

interface DashboardStats {
  totalUsers: number;
  openRequests: number;
  totalVendors: number;
  todayRequests: number;
  totalGMV: number;
  pendingAiReview?: number;
  recentRequests: RecentRequest[];
}

export default function AdminDashboardImproved() {
  const { data: stats, loading } = useAsyncData<DashboardStats>(
    () => apiFetch("/api/admin/stats", "ADMIN"),
    []
  );

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      {/* ╔═══════════════════════════════════════════════════════════════════════╗ */}
      {/* ║                          HEADER SECTION                               ║ */}
      {/* ╚═══════════════════════════════════════════════════════════════════════╝ */}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">لوحة التحكم</h1>
              <p className="text-sm text-slate-500 mt-1">
                نظرة عامة على أداء المنصة والعمليات الجارية
              </p>
            </div>
            <div className="text-sm text-slate-600">
              آخر تحديث: {new Date().toLocaleTimeString("ar-EG")}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ╔═══════════════════════════════════════════════════════════════════════╗ */}
        {/* ║                      KPI CARDS GRID                                   ║ */}
        {/* ╚═══════════════════════════════════════════════════════════════════════╝ */}

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total GMV */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded">
                +12%
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-1">إجمالي المعاملات</p>
            <p className="text-2xl font-bold text-slate-900">
              {formatCurrency(stats?.totalGMV ?? 0).split(".")[0]}
            </p>
          </div>

          {/* Pending Reviews */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
                جديد
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-1">في انتظار المراجعة</p>
            <p className="text-2xl font-bold text-slate-900">
              {stats?.pendingAiReview ?? 0}
            </p>
          </div>

          {/* Open Requests */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
                نشط
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-1">الطلبات النشطة</p>
            <p className="text-2xl font-bold text-slate-900">
              {stats?.openRequests ?? 0}
            </p>
          </div>

          {/* Total Users */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
                إجمالي
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-1">إجمالي المستخدمين</p>
            <p className="text-2xl font-bold text-slate-900">
              {stats?.totalUsers ?? 0}
            </p>
          </div>
        </section>

        {/* ╔═══════════════════════════════════════════════════════════════════════╗ */}
        {/* ║                    MAIN CONTENT GRID                                  ║ */}
        {/* ╚═══════════════════════════════════════════════════════════════════════╝ */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ┌─ Recent Requests (2 columns) ────────────────────────────────────────┐ */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">أحدث العمليات</h2>
                  <p className="text-xs text-slate-500 mt-0.5">آخر 5 طلبات</p>
                </div>
              </div>
              <Link
                href="/admin/requests"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                عرض الكل
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="divide-y divide-slate-200">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="inline-block animate-spin">⏳</div>
                </div>
              ) : (stats?.recentRequests?.length ?? 0) === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-slate-500">لا توجد عمليات حالياً</p>
                </div>
              ) : (
                stats?.recentRequests.map((req) => (
                  <div
                    key={req.id}
                    className="px-6 py-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-mono text-slate-500">
                            #{req.id}
                          </span>
                          <StatusBadge status={req.status} />
                        </div>
                        <p className="font-medium text-slate-900 truncate">
                          {req.title}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          من {req.client?.fullName || "عميل"}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm text-slate-500">
                          {formatDate(req.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ┌─ Quick Actions Sidebar ──────────────────────────────────────────────┐ */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" />
                ملخص اليوم
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">طلبات اليوم</span>
                  <span className="font-semibold text-slate-900">
                    {stats?.todayRequests ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">الطلبات النشطة</span>
                  <span className="font-semibold text-slate-900">
                    {stats?.openRequests ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-sm text-slate-600">بانتظار المراجعة</span>
                  <span className="font-semibold text-blue-600">
                    {stats?.pendingAiReview ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">الإجراءات السريعة</h3>
              <div className="space-y-2">
                <QuickActionLink
                  href="/admin/requests"
                  icon={<Package className="w-4 h-4" />}
                  label="إدارة الطلبات"
                />
                <QuickActionLink
                  href="/admin/users"
                  icon={<Users className="w-4 h-4" />}
                  label="إدارة المستخدمين"
                />
                <QuickActionLink
                  href="/admin/finance"
                  icon={<TrendingUp className="w-4 h-4" />}
                  label="التقارير المالية"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🧩 HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<
    string,
    { label: string; bg: string; text: string; icon: React.ReactNode }
  > = {
    PENDING_ADMIN_REVISION: {
      label: "قيد المراجعة",
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      icon: <Clock className="w-3 h-3" />,
    },
    OPEN_FOR_BIDDING: {
      label: "قيد المزايدة",
      bg: "bg-blue-50",
      text: "text-blue-700",
      icon: <AlertCircle className="w-3 h-3" />,
    },
    CLOSED_SUCCESS: {
      label: "مكتمل",
      bg: "bg-green-50",
      text: "text-green-700",
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
  };

  const config =
    statusConfig[status] ||
    (statusConfig.PENDING_ADMIN_REVISION ?? {
      label: status,
      bg: "bg-gray-50",
      text: "text-gray-700",
      icon: null,
    });

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

function QuickActionLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
    >
      <div className="text-slate-400">{icon}</div>
      <span className="text-sm font-medium flex-1">{label}</span>
      <ArrowRight className="w-4 h-4 text-slate-300" />
    </Link>
  );
}
