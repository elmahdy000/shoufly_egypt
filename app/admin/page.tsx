"use client";

import Link from "next/link";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  Briefcase,
  CircleDollarSign,
  Clock3,
  Eye,
  FileText,
  Package,
  Settings,
  ShieldCheck,
  Sparkles,
  Truck,
  Users,
  Filter,
} from "lucide-react";
import { motion } from "framer-motion";
import { EmptyState, ImprovedCard, StatusBadge } from "@/components/ui/improved-card";
import { ImprovedLoading } from "@/components/ui/improved-loading";

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

type Tone = "primary" | "emerald" | "amber" | "slate" | "indigo" | "rose";
type RequestBadgeStatus = Parameters<typeof StatusBadge>[0]["status"];

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  hint: string;
  tone: Tone;
}

const formatCount = (value: number) => new Intl.NumberFormat("ar-EG").format(value);

const toneStyles: Record<Tone, { gradient: string; icon: string; ring: string }> = {
  primary: {
    gradient: "from-primary/20 via-primary/10 to-transparent",
    icon: "bg-primary/15 text-primary ring-primary/15",
    ring: "border-primary/15",
  },
  emerald: {
    gradient: "from-emerald-500/20 via-emerald-500/10 to-transparent",
    icon: "bg-emerald-500/15 text-emerald-600 ring-emerald-500/15",
    ring: "border-emerald-500/15",
  },
  amber: {
    gradient: "from-amber-500/20 via-amber-500/10 to-transparent",
    icon: "bg-amber-500/15 text-amber-600 ring-amber-500/15",
    ring: "border-amber-500/15",
  },
  slate: {
    gradient: "from-slate-500/20 via-slate-500/10 to-transparent",
    icon: "bg-slate-900/5 text-slate-700 ring-slate-500/15",
    ring: "border-slate-200",
  },
  indigo: {
    gradient: "from-indigo-500/20 via-indigo-500/10 to-transparent",
    icon: "bg-indigo-500/15 text-indigo-600 ring-indigo-500/15",
    ring: "border-indigo-500/15",
  },
  rose: {
    gradient: "from-rose-500/20 via-rose-500/10 to-transparent",
    icon: "bg-rose-500/15 text-rose-600 ring-rose-500/15",
    ring: "border-rose-500/15",
  },
};

const statusBadgeMap: Record<string, RequestBadgeStatus> = {
  active: "active",
  inactive: "inactive",
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
  processing: "processing",
  completed: "completed",
};

const MetricCard = ({ label, value, icon: Icon, hint, tone }: MetricCardProps) => {
  const theme = toneStyles[tone];

  return (
    <ImprovedCard className={`group relative overflow-hidden border ${theme.ring} bg-white/90 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(15,23,42,0.12)]`}>
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${theme.gradient}`} />
      <div className="absolute -right-8 top-0 h-24 w-24 rounded-full bg-slate-950/5 blur-3xl transition-all duration-300 group-hover:scale-125" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{value}</p>
          <p className="mt-2 text-sm text-slate-500">{hint}</p>
        </div>

        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ${theme.icon}`}>
          <Icon size={22} />
        </div>
      </div>
    </ImprovedCard>
  );
};

const quickActions = [
  { label: "مراجعة الطلبات", href: "/admin/requests", icon: Package },
  { label: "تتبع الأسطول", href: "/admin/tracking", icon: Truck },
  { label: "تحليل البيانات", href: "/admin/analytics", icon: BarChart3 },
  { label: "إدارة المستخدمين", href: "/admin/users", icon: Users },
  { label: "إدارة الموردين", href: "/admin/vendors", icon: Briefcase },
  { label: "الإعدادات", href: "/admin/settings", icon: Settings },
];

export default function AdminDashboard() {
  const { data: stats, loading, error } = useAsyncData<DashboardStats>(
    () => apiFetch("/api/admin/stats", "ADMIN"),
    []
  );

  const cards = [
    {
      label: "إجمالي المعاملات",
      value: formatCurrency(stats?.totalGMV ?? 0).split(".")[0],
      icon: CircleDollarSign,
      hint: "إجمالي الحركة المالية",
      tone: "primary" as const,
    },
    {
      label: "طلبات اليوم",
      value: formatCount(stats?.todayRequests ?? 0),
      icon: Clock3,
      hint: "طلبات جديدة اليوم",
      tone: "emerald" as const,
    },
    {
      label: "مراجعات AI",
      value: formatCount(stats?.pendingAiReview ?? 0),
      icon: Sparkles,
      hint: "بانتظار المراجعة الذكية",
      tone: "amber" as const,
    },
    {
      label: "الطلبات المفتوحة",
      value: formatCount(stats?.openRequests ?? 0),
      icon: Package,
      hint: "قيد المتابعة حالياً",
      tone: "indigo" as const,
    },
  ];

  const snapshotValues = [
    { label: "طلبات اليوم", value: stats?.todayRequests ?? 0, tone: "emerald" as const },
    { label: "الطلبات المفتوحة", value: stats?.openRequests ?? 0, tone: "primary" as const },
    { label: "الموردون", value: stats?.totalVendors ?? 0, tone: "indigo" as const },
    { label: "مراجعات AI", value: stats?.pendingAiReview ?? 0, tone: "amber" as const },
  ];

  const maxSnapshot = Math.max(...snapshotValues.map((item) => item.value), 1);
  const nowLabel = new Intl.DateTimeFormat("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center" dir="rtl">
        <EmptyState
          icon={AlertCircle}
          title="تعذر تحميل لوحة الأدمن"
          description="حدث خطأ أثناء جلب البيانات. جرّب إعادة التحميل."
          action={{ label: "إعادة التحميل", onClick: () => window.location.reload() }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 space-y-10" dir="rtl">
      
      {/* 🚀 Modern Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-8 md:p-12 shadow-sm"
      >
        <div className="absolute top-0 left-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -ml-32 -mt-32 opacity-60" />
        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 border border-orange-100 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-orange-700">
              <Sparkles size={14} /> مركز القيادة المركزية
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight tracking-tight">
              أهلاً بك، <span className="text-orange-600">مدير النظام</span>. إليك ملخص الحالة التشغيلية اليوم.
            </h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              تتم متابعة جميع العمليات اللوجستية والمالية بدقة. النظام يعمل بكفاءة تامة حالياً.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
               <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                  <Clock3 size={14} /> آخر تحديث: {nowLabel}
               </div>
               <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-100">
                  <Activity size={14} /> حالة السيرفر: مستقر
               </div>
            </div>
          </div>

          <div className="flex gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
             {cards.slice(0, 2).map((item, i) => (
               <div key={i} className="min-w-[180px] p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{item.value}</p>
                  <p className="text-[10px] font-medium text-slate-500">{item.hint}</p>
               </div>
             ))}
          </div>
        </div>
      </motion.section>

      {/* 📊 Metrics Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <MetricCard {...card} />
          </motion.div>
        ))}
      </section>

      {/* ⚡ Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
               <h2 className="text-xl font-bold text-slate-900">أحدث الطلبات</h2>
               <Link href="/admin/requests" className="text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors">عرض الكل</Link>
            </div>
            
            <ImprovedCard className="bg-white/80 border-slate-200 overflow-hidden shadow-sm">
               {loading ? (
                 <div className="p-10"><ImprovedLoading isLoading={true} variant="card" count={3}><div></div></ImprovedLoading></div>
               ) : stats?.recentRequests?.length ? (
                 <div className="divide-y divide-slate-100">
                   {stats.recentRequests.map((req) => (
                     <div key={req.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold shadow-sm">
                              <Package size={20} />
                           </div>
                           <div>
                              <p className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">#{req.id} - {req.title}</p>
                              <p className="text-xs text-slate-400 font-medium">{formatDate(req.createdAt)} • {req.client?.fullName || 'عميل'}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           {req.status && <StatusBadge status={statusBadgeMap[req.status.toLowerCase()] || "pending"} />}
                           <Link href={`/admin/requests?id=${req.id}`} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all shadow-sm">
                              <Eye size={16} />
                           </Link>
                        </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="p-20"><EmptyState icon={FileText} title="لا توجد طلبات حديثة" description="لم يتم تسجيل أي طلبات في النظام مؤخراً." /></div>
               )}
            </ImprovedCard>
         </div>

         <div className="lg:col-span-4 space-y-6">
            <h2 className="text-xl font-bold text-slate-900">إجراءات سريعة</h2>
            <div className="grid grid-cols-2 gap-4">
               {quickActions.map((action, i) => (
                 <Link 
                   key={i} 
                   href={action.href}
                   className="p-6 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-orange-500 hover:bg-orange-50/30 hover:shadow-md transition-all group scale-100 active:scale-95"
                 >
                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all">
                       <action.icon size={20} />
                    </div>
                    <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-tight">{action.label}</span>
                 </Link>
               ))}
            </div>

            <ImprovedCard className="bg-slate-900 text-white p-6 border-slate-950 shadow-xl overflow-hidden relative">
               <div className="absolute top-0 left-0 w-32 h-32 bg-orange-600/20 blur-3xl -ml-16 -mt-16" />
               <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                  <BarChart3 size={14} /> نبذة الأداء اليوم
               </h3>
               <div className="space-y-4">
                  {snapshotValues.map((item, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between text-[10px] font-bold uppercase">
                          <span className="text-slate-300">{item.label}</span>
                          <span className="text-white">{item.value}</span>
                       </div>
                       <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.value / maxSnapshot) * 100}%` }}
                            className={`h-full rounded-full bg-gradient-to-r ${item.tone === 'primary' ? 'from-orange-500 to-orange-600' : item.tone === 'emerald' ? 'from-emerald-400 to-emerald-500' : 'from-indigo-400 to-indigo-500'}`}
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </ImprovedCard>
         </div>
      </div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.5 }}
        className="pb-2 pt-2 text-center text-sm text-slate-500"
      >
        آخر تحديث: {nowLabel}
      </motion.footer>
    </div>
  );
}
