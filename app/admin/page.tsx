"use client";

import Link from "next/link";
import type { ElementType } from "react";
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
} from "lucide-react";

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
    <div className="admin-page" dir="rtl">
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-6">
        <p className="text-sm text-slate-500">نظرة عامة على حالة المنصة اليوم</p>
        <h1 className="text-3xl font-black text-slate-900">لوحة التحكم</h1>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="إجمالي المعاملات"
          value={loading ? "—" : formatCurrency(stats?.totalGMV ?? 0)}
          icon={Activity}
        />
        <MetricCard
          title="طلبات اليوم"
          value={loading ? "—" : String(stats?.todayRequests ?? 0)}
          icon={Package}
        />
        <MetricCard
          title="المستخدمون"
          value={loading ? "—" : String(stats?.totalUsers ?? 0)}
          icon={Users}
        />
        <MetricCard
          title="التجار"
          value={loading ? "—" : String(stats?.totalVendors ?? 0)}
          icon={Briefcase}
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="glass-card xl:col-span-8 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <h2 className="text-lg font-bold text-slate-900">أحدث الطلبات</h2>
            <Link href="/admin/requests" className="text-sm font-bold text-primary hover:underline">
              عرض الكل
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>المعرف</th>
                  <th>الطلب</th>
                  <th>العميل</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={4} className="h-14 bg-slate-50/60" />
                      </tr>
                    ))
                ) : (stats?.recentRequests?.length ?? 0) === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center text-slate-500 font-bold">
                      لا توجد طلبات حديثة.
                    </td>
                  </tr>
                ) : (
                  stats!.recentRequests.map((req) => (
                    <tr key={req.id}>
                      <td className="font-jakarta">#{req.id}</td>
                      <td className="font-bold text-slate-900">{req.title}</td>
                      <td>{req.client?.fullName || "عميل"}</td>
                      <td className="font-jakarta">{formatDate(req.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-4">
          <div className="glass-card p-5">
            <h3 className="text-base font-bold text-slate-900">الحالة التشغيلية</h3>
            <div className="mt-4 space-y-3">
              <InfoLine label="طلبات مفتوحة" value={String(stats?.openRequests ?? 0)} />
              <InfoLine label="طلبات اليوم" value={String(stats?.todayRequests ?? 0)} />
              <InfoLine label="إجمالي المستخدمين" value={String(stats?.totalUsers ?? 0)} />
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="text-base font-bold text-slate-900 mb-4">إجراءات سريعة</h3>
            <QuickLink href="/admin/finance" icon={FileText} label="مراجعة المعاملات المالية" />
            <QuickLink href="/admin/tracking" icon={Truck} label="متابعة التوصيل المباشر" />
            <QuickLink href="/admin/users" icon={Users} label="إدارة حسابات المستخدمين" />
          </div>
        </div>
      </section>
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
    <div className="glass-card p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon size={18} />
      </div>
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-black text-slate-900 font-jakarta">{value}</p>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
      <span className="text-sm text-slate-600">{label}</span>
      <span className="font-bold text-slate-900 font-jakarta">{value}</span>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: ElementType;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="mb-2 flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
    >
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-primary" />
        <span>{label}</span>
      </div>
      <ArrowUpRight size={16} />
    </Link>
  );
}
