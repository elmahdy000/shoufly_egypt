"use client";

import Link from "next/link";
import { useMemo } from "react";
import { 
  AlertCircle, ArrowLeft, BarChart3, Briefcase, 
  CircleDollarSign, Clock3, Eye, FileText, 
  Package, Settings, Sparkles, Truck, Users,
  TrendingUp, ShieldCheck, Zap, Layers
} from "lucide-react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { ImprovedCard } from "@/components/ui/improved-card";
import { ImprovedButton } from "@/components/ui/improved-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { motion } from "framer-motion";

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
  pendingAiReview: number;
  pendingWithdrawals: number;
  activeDeliveries: number;
  totalAdmins: number;
  onlineAdmins: number;
  recentRequests: RecentRequest[];
}

const quickActions = [
  { label: "الطلبات", href: "/admin/requests", icon: Package, color: "text-blue-500", bg: "bg-blue-50" },
  { label: "تتبع الأسطول", href: "/admin/tracking", icon: Truck, color: "text-emerald-500", bg: "bg-emerald-50" },
  { label: "التحليلات", href: "/admin/analytics", icon: BarChart3, color: "text-indigo-500", bg: "bg-indigo-50" },
  { label: "المستخدمين", href: "/admin/users", icon: Users, color: "text-orange-500", bg: "bg-orange-50" },
  { label: "الموردين", href: "/admin/vendors", icon: Briefcase, color: "text-primary", bg: "bg-primary/10" },
  { label: "الإعدادات", href: "/admin/settings", icon: Settings, color: "text-slate-500", bg: "bg-slate-100" },
];

import { ShooflyLoader } from "@/components/shoofly/loader";

export default function AdminDashboard() {
  const { data: stats, loading, error } = useAsyncData<DashboardStats>(
    () => apiFetch("/api/admin/stats", "ADMIN"), 
    []
  );

  const cards = useMemo(() => [
    {
      label: "إجمالي التداول المالي",
      value: stats ? formatCurrency(Math.floor(stats.totalGMV)) : "٠",
      icon: CircleDollarSign,
      hint: "القيمة الإجمالية للعمليات المنفذة بالمنصة",
      trend: "+١٢.٥٪",
      trendUp: true,
      color: "blue",
      borderColor: "border-blue-100",
      accentColor: "bg-blue-500 text-white",
      bgGradient: "from-blue-50 to-white"
    },
    {
      label: "عمليات الميدان اليوم",
      value: stats?.todayRequests ?? 0,
      icon: Zap,
      hint: "إجمالي الطلبات المستلمة خلال ٢٤ ساعة",
      trend: "+٥ وحدات",
      trendUp: true,
      color: "emerald",
      borderColor: "border-emerald-100",
      accentColor: "bg-emerald-500 text-white",
      bgGradient: "from-emerald-50 to-white"
    },
    {
        label: "تنبيهات المراقبة الذكية",
        value: stats?.pendingAiReview ?? 0,
        icon: Sparkles,
        hint: "طلبات بانتظار المراجعة والتدقيق الإداري",
        trend: stats?.pendingAiReview ? "مراجعة مطلوبة" : "النظام مستقر",
        trendUp: false,
        color: "orange",
        borderColor: "border-orange-100",
        accentColor: "bg-orange-500 text-white",
        bgGradient: "from-orange-50 to-white"
      },
    {
      label: "الطلبات النشطة الآن",
      value: stats?.openRequests ?? 0,
      icon: Package,
      hint: "طلبات مفتوحة للمزايدة بالوقت الفعلي",
      trend: "متابعة مباشرة",
      trendUp: true,
      color: "primary",
      borderColor: "border-primary/20",
      accentColor: "bg-primary text-white",
      bgGradient: "from-primary/10 to-white"
    },
  ], [stats]);

  if (loading && !stats) {
    return <ShooflyLoader message="بنجمعلك إحصائيات النظام..." />;
  }

  const nowLabel = new Intl.DateTimeFormat("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "long"
  }).format(new Date());

  if (error) {
    return (
      <div className="p-6 lg:p-10 font-cairo" dir="rtl">
        <div className="p-12 text-center bg-white border border-red-100 shadow-xl shadow-red-500/5 rounded-3xl max-w-2xl mx-auto mt-20">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertCircle size={40} strokeWidth={2} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">الاتصال بمركز البيانات قطع</h2>
          <p className="mt-3 text-base font-medium text-slate-500">حصل مشكلة في تحديث البيانات. ياريت تتأكد إن السيرفر شغال كويس.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 px-8 h-12 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 active:scale-95"
          >
            حاول تاني دلوقتي
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-10 font-cairo antialiased min-h-screen bg-slate-50" dir="rtl">
      
      {/* 🌟 ELEGANT HEADER */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-xs font-bold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">تحديث لايف</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">لوحة التحكم</h1>
          <p className="text-base text-slate-500 font-medium">دير كل الشغل والفلوس لشبكة شوفلي مصر من مكان واحد.</p>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="bg-white border border-slate-100 p-4 px-6 rounded-2xl flex items-center gap-5 shadow-sm">
                <div className="flex -space-x-3 rtl:space-x-reverse">
                    {[1,2,3].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shadow-sm">
                            م
                        </div>
                    ))}
                </div>
                <div className="border-r border-slate-100 pr-5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">المشرفين المتصلين حالياً</p>
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-slate-800">
                            {String(stats?.onlineAdmins ?? 1).padStart(2, '0')}
                        </span>
                    </div>
                </div>
            </div>
            <div className="bg-white border border-slate-100 p-4 px-6 rounded-2xl flex items-center gap-3 shadow-sm text-slate-700">
                <Clock3 size={20} className="text-primary" />
                <span className="text-sm font-bold">{nowLabel}</span>
            </div>
        </div>
      </header>

      {/* 📊 PREMIUM KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
                <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group"
                >
                    <div className={`bg-gradient-to-br ${card.bgGradient} border ${card.borderColor} rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden`}>
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${card.accentColor}`}>
                                <Icon size={24} />
                            </div>
                            <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white border border-slate-100 text-slate-600 shadow-sm`}>
                                {card.trendUp && <TrendingUp size={12} className="text-emerald-500" />}
                                {card.trend}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-slate-500">{card.label}</h3>
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-black text-slate-900 tracking-tight">
                                    {loading ? "..." : card.value}
                                </span>
                            </div>
                            <p className="text-[11px] font-medium text-slate-400 pt-2 opacity-80">{card.hint}</p>
                        </div>
                    </div>
                </motion.div>
            );
        })}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* 📋 DATA HUB (CLEAN TABLE) */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center"><Layers size={20} /></div>
                <div>
                    <h2 className="text-xl font-black text-slate-900">آخر العمليات</h2>
                    <p className="text-xs text-slate-500 mt-0.5">سجل لايف لآخر الطلبات اللي حصلت</p>
                </div>
              </div>
              <Link href="/admin/requests" className="text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                شوف الأرشيف <ArrowLeft size={14} />
              </Link>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="space-y-4 p-8">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-slate-50 animate-pulse border border-slate-100" />
                ))}
              </div>
            ) : stats?.recentRequests?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                    <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500">
                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider">الطلب</th>
                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-center">العميل</th>
                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-center">الحالة</th>
                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-left">التاريخ</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                    {stats.recentRequests.map((req) => (
                        <tr key={req.id} className="group hover:bg-slate-50/50 transition-colors cursor-pointer">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 border border-slate-100 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                <FileText size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{req.title}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">#{req.id}</p>
                            </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-bold text-slate-600">
                            {req.client?.fullName || "عميل غير مسمى"}
                        </td>
                        <td className="px-6 py-4 text-center">
                            <StatusBadge status={req.status} className="scale-90 shadow-sm" />
                        </td>
                        <td className="px-6 py-4 text-left text-[11px] font-bold text-slate-500">
                            {formatDate(req.createdAt)}
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
              </div>
            ) : (
                <div className="py-20 text-center space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                        <FileText size={32} />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-slate-700">مفيش أي سجلات</p>
                        <p className="text-xs text-slate-400 mt-1">هتظهر كل الأنشطة هنا أول ما الشغل يبدأ.</p>
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* 🛠 ELEGANT SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center"><Zap size={16} /></div>
                <h2 className="text-lg font-black text-slate-900">في السريع</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group bg-slate-50 border border-slate-100 p-4 rounded-2xl transition-all hover:border-primary/30 hover:bg-white hover:shadow-md"
                  >
                    <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${action.bg} ${action.color}`}>
                      <Icon size={20} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 group-hover:text-primary transition-colors">{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
            
            <div className="relative z-10 flex flex-col gap-8">
                <div className="flex items-center justify-between border-b border-slate-800 pb-6">
                    <h2 className="text-lg font-black text-white">إحصائيات الشبكة</h2>
                    <ShieldCheck size={24} className="text-primary" />
                </div>
                
                <div className="grid gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 mb-1">العملاء الشغالين</p>
                            <p className="text-2xl font-black">{stats?.totalUsers ?? 0}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center"><Users size={20} /></div>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 mb-1">الصنايعية المعتمدين</p>
                            <p className="text-2xl font-black">{stats?.totalVendors ?? 0}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center"><Briefcase size={20} /></div>
                    </div>

                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 backdrop-blur-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 mb-1">المناديب</p>
                            <p className="text-2xl font-black">{stats?.activeDeliveries ?? 0}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center"><Truck size={20} /></div>
                    </div>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
