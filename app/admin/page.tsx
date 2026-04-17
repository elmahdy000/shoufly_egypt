"use client";

import Link from "next/link";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Activity, Users, Package, TrendingUp, ChevronRight, CreditCard, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

interface RecentRequest {
  id: number;
  title: string;
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

export default function AdminDashboard() {
  const { data: stats, loading } = useAsyncData<DashboardStats>(
    () => apiFetch("/api/admin/stats", "ADMIN"),
    []
  );

  const metrics = [
    {
      title: "إجمالي المبيعات",
      value: formatCurrency(stats?.totalGMV ?? 0).split('.')[0],
      change: "+12.5%",
      icon: CreditCard,
      color: "from-orange-400 to-orange-600",
    },
    {
      title: "الطلبات المفتوحة",
      value: stats?.openRequests ?? 0,
      change: stats?.openRequests ? "+3 اليوم" : "لا توجد",
      icon: Package,
      color: "from-blue-400 to-blue-600",
    },
    {
      title: "طلبات اليوم",
      value: stats?.todayRequests ?? 0,
      icon: Activity,
      color: "from-green-400 to-green-600",
    },
    {
      title: "إجمالي المستخدمين",
      value: stats?.totalUsers ?? 0,
      change: "+24 هذا الشهر",
      icon: Users,
      color: "from-purple-400 to-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Page Header */}
      <div className="px-8 py-10 border-b border-gray-200">
        <div className="max-w-7xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">لوحة التحكم</h1>
          <p className="text-gray-600 font-medium">مرحبا بك في مركز العمليات والإحصائيات</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-12">
        <div className="max-w-7xl space-y-12">
          
          {/* Metrics Grid */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((metric, idx) => {
                const Icon = metric.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${metric.color} text-white`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      {metric.change && (
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                          {metric.change}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 font-medium mb-1">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{typeof metric.value === 'number' ? metric.value.toLocaleString('ar-EG') : metric.value}</p>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Recent Requests Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">أحدث الطلبات</h2>
              <Link
                href="/admin/requests"
                className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold text-sm"
              >
                عرض الكل
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wide">
                        معرف الطلب
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wide">
                        نوع الطلب
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wide">
                        العميل
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wide">
                        التاريخ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center">
                          <div className="flex justify-center">
                            <div className="w-8 h-8 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
                          </div>
                        </td>
                      </tr>
                    ) : (stats?.recentRequests?.length ?? 0) === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                          لا توجد طلبات حالياً
                        </td>
                      </tr>
                    ) : (
                      stats!.recentRequests.slice(0, 5).map((req, idx) => (
                        <motion.tr
                          key={req.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="hover:bg-gray-50 transition-colors group cursor-pointer"
                        >
                          <td className="px-6 py-4 text-sm text-gray-600 font-medium">TX_{req.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{req.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{req.client?.fullName || "عميل"}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{formatDate(req.createdAt)}</td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">إجراءات سريعة</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/admin/users"
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all group"
                >
                  <Users className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
                  <span className="text-sm font-semibold text-gray-900 group-hover:text-orange-600">إدارة المستخدمين</span>
                </Link>
                <Link
                  href="/admin/requests"
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all group"
                >
                  <Package className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
                  <span className="text-sm font-semibold text-gray-900 group-hover:text-orange-600">إدارة الطلبات</span>
                </Link>
                <Link
                  href="/admin/reports"
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all group"
                >
                  <TrendingUp className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
                  <span className="text-sm font-semibold text-gray-900 group-hover:text-orange-600">التقارير</span>
                </Link>
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all group"
                >
                  <Activity className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
                  <span className="text-sm font-semibold text-gray-900 group-hover:text-orange-600">الإعدادات</span>
                </Link>
              </div>
            </div>

            {/* Performance Card */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-8 text-white shadow-lg">
              <h3 className="text-lg font-bold mb-4">الأداء</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-sm opacity-90 mb-2">معدل النجاح</p>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-white rounded-full h-2" style={{ width: "94%" }} />
                  </div>
                  <p className="text-xs opacity-75 mt-2">94% معدل نجاح العمليات</p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/20">
                  <span className="text-sm opacity-90">وقت الاستجابة</span>
                  <span className="text-lg font-bold">143ms</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
