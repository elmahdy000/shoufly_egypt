"use client";

import Link from "next/link";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Activity, ArrowUpRight, Package, Users, LayoutDashboard, Zap, CreditCard, ChevronLeft, Target, AlertCircle } from "lucide-react";
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

  return (
    <div className="min-h-full bg-slate-100 pb-20" dir="rtl">
      {/* Header */}
      <div className="bg-slate-950 text-white sticky top-0 z-40 shadow-xl border-b-4 border-cyan-500">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-black text-white">لوحة التحكم والعمليات</h1>
          <p className="text-slate-400 text-sm mt-2">رصد حي للمنصة والعمليات المالية</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border-4 border-slate-950 shadow-lg hover:shadow-xl transition-all hover:translate-y-[-4px]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center text-white">
                <CreditCard size={24} />
              </div>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">إجمالي المبيعات</p>
            <p className="text-2xl font-black text-slate-950">{formatCurrency(stats?.totalGMV ?? 0).split('.')[0]}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border-4 border-slate-950 shadow-lg hover:shadow-xl transition-all hover:translate-y-[-4px]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-white">
                <Activity size={24} />
              </div>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">الطلبات المفتوحة</p>
            <p className="text-2xl font-black text-slate-950">{stats?.openRequests ?? 0}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border-4 border-slate-950 shadow-lg hover:shadow-xl transition-all hover:translate-y-[-4px]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                <Package size={24} />
              </div>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">طلبات اليوم</p>
            <p className="text-2xl font-black text-slate-950">{stats?.todayRequests ?? 0}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border-4 border-slate-950 shadow-lg hover:shadow-xl transition-all hover:translate-y-[-4px]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                <Users size={24} />
              </div>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">المستخدمين</p>
            <p className="text-2xl font-black text-slate-950">{stats?.totalUsers ?? 0}</p>
          </div>
        </div>

        {/* Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activity Table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border-4 border-slate-950 overflow-hidden shadow-xl">
            <div className="bg-slate-50 border-b-4 border-slate-200 px-8 py-6">
              <h2 className="text-2xl font-black text-slate-950 flex items-center gap-3">
                <Activity size={28} />
                أحدث العمليات
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-slate-300">
                    <th className="px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-wider">المعرف</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-wider">الطلب</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-wider">العميل</th>
                    <th className="px-6 py-4 text-xs font-black text-slate-600 uppercase tracking-wider text-left">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                        <div className="animate-pulse">جاري التحميل...</div>
                      </td>
                    </tr>
                  ) : (stats?.recentRequests?.length ?? 0) === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-bold">
                        لا توجد عمليات حالياً
                      </td>
                    </tr>
                  ) : (
                    stats!.recentRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 font-bold text-slate-400 text-sm">TX_{req.id}</td>
                        <td className="px-6 py-4 font-bold text-slate-950">{req.title}</td>
                        <td className="px-6 py-4 text-slate-700">{req.client?.fullName || "عميل"}</td>
                        <td className="px-6 py-4 text-slate-500 text-sm text-left">{formatDate(req.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-slate-950 rounded-2xl p-8 text-white border-r-4 border-cyan-500 shadow-xl">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                إجراءات سريعة
              </h3>
              <div className="space-y-3">
                <Link href="/admin/users">
                  <button className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-xl text-left font-bold transition-all group border-2 border-white/10 hover:border-white/30">
                    <div className="flex items-center justify-between">
                      <span>إدارة المستخدمين</span>
                      <ChevronLeft size={18} className="group-hover:-translate-x-2 transition-transform" />
                    </div>
                  </button>
                </Link>
                <Link href="/admin/requests">
                  <button className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-xl text-left font-bold transition-all group border-2 border-white/10 hover:border-white/30">
                    <div className="flex items-center justify-between">
                      <span>الطلبات والعمليات</span>
                      <ChevronLeft size={18} className="group-hover:-translate-x-2 transition-transform" />
                    </div>
                  </button>
                </Link>
              </div>
            </div>

            {/* Stats Box */}
            <div className="bg-white rounded-2xl p-8 border-4 border-slate-950 shadow-xl space-y-4">
              <h3 className="text-xs font-black text-slate-950 uppercase tracking-widest mb-6 pb-4 border-b-2 border-slate-200">
                الحالة التشغيلية
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                  <span className="text-slate-600 font-bold">طلبات اليوم</span>
                  <span className="text-xl font-black text-slate-950">{stats?.todayRequests ?? 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                  <span className="text-slate-600 font-bold">إجمالي الأعضاء</span>
                  <span className="text-xl font-black text-slate-950">{stats?.totalUsers ?? 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                  <span className="text-slate-600 font-bold">الموردين</span>
                  <span className="text-xl font-black text-slate-950">{stats?.totalVendors ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Revenue Box */}
            <div className="bg-emerald-500 rounded-2xl p-6 border-4 border-slate-950 flex items-center justify-between shadow-xl hover:scale-105 transition-transform">
              <div>
                <p className="text-xs font-black text-slate-950 uppercase">المبيعات الإجمالية</p>
                <p className="text-2xl font-black text-slate-950 mt-2">{formatCurrency(stats?.totalGMV ?? 0).split('.')[0]}</p>
              </div>
              <div className="w-14 h-14 bg-slate-950 rounded-xl flex items-center justify-center text-white">
                <ArrowUpRight size={28} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
