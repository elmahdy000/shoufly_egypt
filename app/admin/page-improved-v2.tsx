"use client";

import Link from "next/link";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  Activity,
  ArrowUpRight,
  Briefcase,
  FileText,
  Package,
  Truck,
  Users,
  Target,
  AlertCircle,
  TrendingUp,
  Eye,
} from "lucide-react";
import { motion } from "framer-motion";
import { ImprovedCard } from "@/components/ui/improved-card";
import { ImprovedLoading, ImprovedLoadingSpinner } from "@/components/ui/improved-loading";
import { StatusBadge } from "@/components/ui/improved-card";
import { EmptyState } from "@/components/ui/improved-card";

interface RecentRequest {
  id: number;
  title: string;
  createdAt: string;
  status?: string;
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

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ size: number; className?: string }>;
  trend?: { value: number; isPositive: boolean };
  color: "primary" | "emerald" | "amber" | "slate" | "indigo";
}

const MetricCard = ({ label, value, icon: Icon, trend, color }: MetricCardProps) => {
  const colorMap = {
    primary: "bg-primary/10 text-primary",
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    slate: "bg-slate-200 text-slate-700",
    indigo: "bg-indigo-100 text-indigo-600",
  };

  return (
    <ImprovedCard className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-2">{label}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {trend && (
            <div
              className={`mt-2 flex items-center gap-1 text-sm ${
                trend.isPositive ? "text-emerald-600" : "text-red-600"
              }`}
            >
              <TrendingUp size={14} className={trend.isPositive ? "" : "rotate-180"} />
              <span>{Math.abs(trend.value)}% عن الأمس</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorMap[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </ImprovedCard>
  );
};

export default function AdminDashboardImproved() {
  const { data: stats, loading, error } = useAsyncData<DashboardStats>(
    () => apiFetch("/api/admin/stats", "ADMIN"),
    []
  );

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <EmptyState
            icon={AlertCircle}
            title="حدث خطأ في تحميل البيانات"
            description="يرجى محاولة التحديث"
            action={{
              label: "إعادة التحميل",
              onClick: () => window.location.reload(),
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900">
                لوحة التحكم
              </h1>
              <p className="text-slate-600 text-sm md:text-base mt-1">
                مرحباً بك في مركز التحكم، آخر تحديث:{" "}
                {new Date().toLocaleTimeString("ar-EG")}
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-semibold text-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              النظام يعمل بكفاءة
            </div>
          </div>
        </motion.div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 20 }} transition={{ delay: 0.1 }}>
            <ImprovedLoading isLoading={loading}>
              <MetricCard
                label="إجمالي المعاملات"
                value={formatCurrency(stats?.totalGMV ?? 0).split(".")[0]}
                icon={Activity}
                trend={{ value: 12, isPositive: true }}
                color="primary"
              />
            </ImprovedLoading>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 20 }} transition={{ delay: 0.2 }}>
            <ImprovedLoading isLoading={loading}>
              <MetricCard
                label="طلبات الـ AI للمراجعة"
                value={stats?.pendingAiReview ?? 0}
                icon={AlertCircle}
                trend={{ value: 8, isPositive: false }}
                color="amber"
              />
            </ImprovedLoading>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 20 }} transition={{ delay: 0.3 }}>
            <ImprovedLoading isLoading={loading}>
              <MetricCard
                label="طلبات قيد المتابعة"
                value={stats?.openRequests ?? 0}
                icon={Package}
                trend={{ value: 5, isPositive: true }}
                color="slate"
              />
            </ImprovedLoading>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 20 }} transition={{ delay: 0.4 }}>
            <ImprovedLoading isLoading={loading}>
              <MetricCard
                label="قاعدة المستخدمين"
                value={stats?.totalUsers ?? 0}
                icon={Users}
                trend={{ value: 3, isPositive: true }}
                color="indigo"
              />
            </ImprovedLoading>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Requests - Main */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 20 }}
            transition={{ delay: 0.5 }}
          >
            <ImprovedCard className="h-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">الطلبات الأخيرة</h2>
                  <p className="text-sm text-slate-500 mt-1">آخر الطلبات المسجلة في النظام</p>
                </div>
                <Link
                  href="/admin/requests"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10 rounded-lg transition"
                >
                  <span>عرض الكل</span>
                  <Eye size={16} />
                </Link>
              </div>

              <ImprovedLoading
                isLoading={loading}
                variant="line"
                count={3}
              >
                {stats?.recentRequests && stats.recentRequests.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentRequests.slice(0, 5).map((req, i) => (
                      <motion.div
                        key={req.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition cursor-pointer border border-slate-100 hover:border-primary/30"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 truncate">
                              {req.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              من: {req.client?.fullName || "عميل غير معروف"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {req.status && (
                              <StatusBadge status={req.status as any} size="sm" />
                            )}
                            <span className="text-xs text-slate-400">
                              {formatDate(req.createdAt)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={FileText}
                    title="لا توجد طلبات حالياً"
                    description="لم تتلقَ أي طلبات بعد"
                  />
                )}
              </ImprovedLoading>
            </ImprovedCard>
          </motion.div>

          {/* Right Sidebar - Quick Stats */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 20 }}
            transition={{ delay: 0.6 }}
          >
            {/* Quick Actions */}
            <ImprovedCard>
              <h3 className="text-lg font-bold text-slate-900 mb-4">إجراءات سريعة</h3>
              <div className="space-y-2">
                {[
                  { icon: Users, label: "إدارة المستخدمين", href: "/admin/users" },
                  { icon: Briefcase, label: "مراجعة الطلبات", href: "/admin/requests" },
                  { icon: Activity, label: "التحليلات", href: "/admin/analytics" },
                  { icon: Target, label: "الإعدادات", href: "/admin/settings" },
                ].map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={i}
                      href={action.href}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition text-slate-700 hover:text-slate-900 font-medium"
                    >
                      <Icon size={20} className="text-primary" />
                      <span className="flex-1">{action.label}</span>
                      <ArrowUpRight size={16} className="text-slate-400" />
                    </Link>
                  );
                })}
              </div>
            </ImprovedCard>

            {/* System Status */}
            <ImprovedCard>
              <h3 className="text-lg font-bold text-slate-900 mb-4">حالة النظام</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">التخزين</span>
                  <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-emerald-500" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">الذاكرة</span>
                  <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-blue-500" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">الـ CPU</span>
                  <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full w-2/5 bg-amber-500" />
                  </div>
                </div>
              </div>
            </ImprovedCard>
          </motion.div>
        </div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="border-t border-slate-200 pt-6 text-center text-sm text-slate-500"
        >
          <p>
            آخر تحديث:{" "}
            {new Date().toLocaleTimeString("ar-EG", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" "} | شوفلي لوحة التحكم v1.0
          </p>
        </motion.div>
      </div>
    </div>
  );
}
