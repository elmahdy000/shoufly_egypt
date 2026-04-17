"use client";

import Link from "next/link";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Activity, Users, Package, TrendingUp, ChevronRight } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
              <p className="text-sm text-gray-500 mt-1">إدارة العمليات والإحصائيات</p>
            </div>
            <div className="flex gap-3">
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition">
                تسجيل الخروج
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Sales */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">إجمالي المبيعات</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.totalGMV ?? 0).split('.')[0]}
                </p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={20} className="text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500">↑ 12% من الشهر الماضي</p>
          </div>

          {/* Open Requests */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">الطلبات المفتوحة</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.openRequests ?? 0}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity size={20} className="text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500">تحتاج متابعة</p>
          </div>

          {/* Today Requests */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">طلبات اليوم</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.todayRequests ?? 0}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Package size={20} className="text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500">منذ منتصف الليل</p>
          </div>

          {/* Total Users */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">إجمالي المستخدمين</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers ?? 0}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users size={20} className="text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500">نشطين حالياً</p>
          </div>
        </div>

        {/* Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Activity Table */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">أحدث العمليات</h2>
                  <Link href="/admin/requests" className="text-sm font-medium text-orange-600 hover:text-orange-700">
                    عرض الكل →
                  </Link>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">المعرف</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">نوع الطلب</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">العميل</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                          جاري التحميل...
                        </td>
                      </tr>
                    ) : (stats?.recentRequests?.length ?? 0) === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                          لا توجد عمليات حالياً
                        </td>
                      </tr>
                    ) : (
                      stats!.recentRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-500">TX_{req.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{req.title}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{req.client?.fullName || "عميل"}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 text-left">{formatDate(req.createdAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">الإجراءات السريعة</h3>
              <div className="space-y-3">
                <Link href="/admin/users">
                  <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-orange-50 rounded-lg transition-colors group">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600">إدارة المستخدمين</span>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-orange-600" />
                  </button>
                </Link>
                <Link href="/admin/requests">
                  <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-orange-50 rounded-lg transition-colors group">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600">جميع الطلبات</span>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-orange-600" />
                  </button>
                </Link>
                <Link href="/admin/requests">
                  <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-orange-50 rounded-lg transition-colors group">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600">التقارير المالية</span>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-orange-600" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Status Box */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">الحالة التشغيلية</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">طلبات اليوم</span>
                  <span className="text-lg font-bold text-gray-900">{stats?.todayRequests ?? 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">إجمالي الأعضاء</span>
                  <span className="text-lg font-bold text-gray-900">{stats?.totalUsers ?? 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">الموردين</span>
                  <span className="text-lg font-bold text-gray-900">{stats?.totalVendors ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Server Status */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900">حالة الخادم</h3>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-xs text-gray-600">جميع الأنظمة تعمل بشكل طبيعي</p>
              <div className="mt-4 p-3 bg-white rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats?.totalGMV ?? 0).split('.')[0]}</p>
                <p className="text-xs text-gray-500 mt-1">إجمالي المبيعات</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
