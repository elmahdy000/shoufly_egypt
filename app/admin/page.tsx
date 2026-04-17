"use client";

import Link from "next/link";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  Activity, ArrowUpRight, Briefcase, FileText,
  Package, Truck, Users, LayoutDashboard,
  Zap, CreditCard, ChevronLeft, Target, AlertCircle, TrendingUp, Clock, CheckCircle, Store,
} from "lucide-react";
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

  const statCards = [
    { label: "المستخدمون النشطون", value: stats?.totalUsers, icon: Users, color: "from-cyan-500 to-blue-500" },
    { label: "الطلبات المفتوحة", value: stats?.openRequests, icon: FileText, color: "from-amber-500 to-orange-500" },
    { label: "المتاجر المسجلة", value: stats?.totalVendors, icon: Store, color: "from-emerald-500 to-teal-500" },
    { label: "الطلبات اليوم", value: stats?.todayRequests, icon: Activity, color: "from-purple-500 to-pink-500" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 font-sans" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
            </div>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition">
              تسجيل الخروج
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className="relative bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10`}>
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <TrendingUp className="w-4 h-4 text-success opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">{loading ? "..." : stat.value?.toLocaleString() || 0}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Recent Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-2xl p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">الطلبات الأخيرة</h2>
            </div>
            <Link href="#" className="text-sm text-primary hover:text-primary/80 transition">
              عرض الكل
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
            ) : stats?.recentRequests && stats.recentRequests.length > 0 ? (
              stats.recentRequests.map((req) => (
                <motion.div
                  key={req.id}
                  whileHover={{ x: -4 }}
                  className="flex items-center justify-between p-4 bg-background rounded-xl hover:bg-muted/50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-2 h-2 rounded-full bg-primary group-hover:bg-success transition-colors" />
                    <div className="flex-1">
                      <p className="text-foreground font-medium">{req.title}</p>
                      <p className="text-xs text-muted-foreground">من {req.client?.fullName || "عميل"}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(req.createdAt)}</span>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">لا توجد طلبات حالياً</div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}


  return (
    <div className="min-h-full bg-[#F1F5F9] pb-32 font-sans text-right" dir="rtl">
      
      {/* 🚀 Header: Professional & Impactful */}
      <section className="bg-slate-950 text-white border-b-8 border-primary sticky top-0 z-40 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -mr-40 -mt-40 opacity-50" />
        <div className="w-full px-8 lg:px-12 py-10 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.8)]" />
                  <span className="text-[11px] font-black tracking-[0.4em] text-primary uppercase">نظام التحليل الفوري v3.4</span>
               </div>
               <h1 className="text-4xl font-black tracking-tighter text-white leading-tight">مركز <span className="text-primary italic">السيطرة</span> والعمليات</h1>
               <p className="text-base text-slate-400 font-bold max-w-2xl leading-relaxed">رصد حي لكفاءة المنصة، متابعة التدفقات المالية، وإدارة التوسعات التجارية.</p>
            </div>
            
            <div className="flex gap-4 p-4 bg-white/5 border-2 border-white/10 rounded-[2rem] shadow-2xl">
               <div className="px-8 py-3 text-center border-l-2 border-white/10 last:border-l-0">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">حالة السيرفر</p>
                  <p className="text-lg font-black text-emerald-400 flex items-center gap-2 justify-center italic">ONLINE <Zap size={16} /></p>
               </div>
               <div className="px-8 py-3 text-center">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">توقيت النظام</p>
                  <p className="text-lg font-black text-white font-jakarta">{new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full px-8 lg:px-12 py-12 space-y-12">
        
        {/* 📊 High-Contrast KPI Cluster */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnMetric label="إجمالي المعاملات" val={formatCurrency(stats?.totalGMV ?? 0).split('.')[0]} icon={CreditCard} color="bg-primary" light delay={0.1} />
            <AnMetric label="طلبات الـ AI للمراجعة" val={stats?.pendingAiReview ?? 0} icon={AlertCircle} color="bg-amber-600" delay={0.2} />
            <AnMetric label="طلبات قيد المتابعة" val={stats?.openRequests ?? 0} icon={Package} color="bg-slate-900" delay={0.3} />
            <AnMetric label="قاعدة المستخدمين" val={stats?.totalUsers ?? 0} icon={Users} color="bg-indigo-600" delay={0.4} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
           
           {/* 📋 Ledger Stream: High Visibility Table */}
           <div className="lg:col-span-8 bg-white border-4 border-slate-950 rounded-[3rem] shadow-[20px_20px_0px_rgba(15,23,42,0.03)] overflow-hidden">
              <div className="px-8 py-8 border-b-4 border-slate-50 flex items-center justify-between bg-slate-50/20">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-white shadow-xl">
                       <Activity size={28} />
                    </div>
                    <div>
                       <h2 className="text-2xl font-black text-slate-950">أحدث العمليات</h2>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Real-time Activity Log</p>
                    </div>
                 </div>
                 <Link href="/admin/requests" className="px-6 py-3 bg-white hover:bg-slate-950 hover:text-white rounded-xl text-xs font-black transition-all border-2 border-slate-200 hover:border-slate-950 shadow-sm">عرض كل السجلات</Link>
              </div>
              
              <div className="overflow-x-auto">
                 <table className="w-full text-right border-collapse">
                    <thead>
                       <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 italic">
                          <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest">المعرف</th>
                          <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-right">نوع الطلب</th>
                          <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-right">المبادر بالعملية</th>
                          <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-left">التوقيت</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y-4 divide-slate-50">
                       {loading ? (
                         Array.from({ length: 5 }).map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={4} className="h-20 bg-slate-100/30" /></tr>)
                       ) : (stats?.recentRequests?.length ?? 0) === 0 ? (
                         <tr><td colSpan={4} className="py-32 text-center font-black text-slate-300 text-3xl opacity-20 italic">لا توجد عمليات نشطة حالياً</td></tr>
                       ) : (
                         stats!.recentRequests.map(req => (
                           <tr key={req.id} className="group hover:bg-primary/5 cursor-pointer transition-all border-b border-slate-50 last:border-0">
                              <td className="px-8 py-6 font-jakarta text-sm font-black text-slate-400 group-hover:text-slate-950">TX_#{req.id}</td>
                              <td className="px-8 py-6 text-lg font-black text-slate-950 leading-tight group-hover:translate-x-[-4px] transition-transform">{req.title}</td>
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-xs font-black text-slate-500 group-hover:bg-primary group-hover:text-slate-950 group-hover:rotate-6 transition-all">{req.client?.fullName?.charAt(0) || "U"}</div>
                                    <span className="text-sm font-bold text-slate-700">{req.client?.fullName || "عميل النظام"}</span>
                                 </div>
                              </td>
                              <td className="px-8 py-6 text-left font-jakarta text-[11px] font-black text-slate-400 group-hover:text-slate-950">{formatDate(req.createdAt)}</td>
                           </tr>
                         ))
                       )}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* ⚡ Command Radar: Bold Actions */}
           <div className="lg:col-span-4 space-y-8">
              <div className="bg-slate-950 rounded-[2.5rem] p-10 text-white shadow-2xl border-r-8 border-primary relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                 <h3 className="text-xl font-black tracking-tight mb-8 relative z-10 flex items-center gap-3">
                   إجراءات السيطرة <span className="text-primary italic text-[10px] uppercase tracking-[0.3em] font-light">Rapid_View</span>
                 </h3>
                 <div className="space-y-4 relative z-10">
                    <AdmQuickLink href="/admin/finance" icon={Target} label="تحليل التدفقات المالية" />
                    <AdmQuickLink href="/admin/tracking" icon={LayoutDashboard} label="مراقبة العمليات اللوجستية" />
                    <AdmQuickLink href="/admin/users" icon={Target} label="إدارة قاعدة البيانات" />
                 </div>
              </div>

              <div className="bg-white border-4 border-slate-950 rounded-[2.5rem] p-10 shadow-xl space-y-8">
                 <h3 className="text-xs font-black text-slate-950 border-white/5 pb-2 uppercase tracking-[0.4em] flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    الحالة التشغيلية
                 </h3>
                 <div className="space-y-4">
                    <StatusLine label="الطلبات المسجلة اليوم" val={stats?.todayRequests ?? 0} />
                    <StatusLine label="إجمالي عضويات المنصة" val={stats?.totalUsers ?? 0} />
                    <StatusLine label="النشاط التجاري للعملاء" val={stats?.totalVendors ?? 0} />
                 </div>
              </div>

              <div className="bg-emerald-500 rounded-[2.5rem] p-8 border-4 border-slate-950 flex items-center justify-between shadow-2xl hover:scale-[1.02] transition-all">
                 <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-950 uppercase tracking-[0.3em]">قوة المبيعات اليومية</p>
                    <p className="text-3xl font-black text-slate-950 font-jakarta tracking-tighter leading-none">{formatCurrency(stats?.totalGMV ?? 0).split('.')[0]}</p>
                 </div>
                 <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center text-white shadow-3xl">
                    <ArrowUpRight size={32} />
                 </div>
              </div>
           </div>
        </section>
      </div>
    </div>
  );
}

function AnMetric({ label, val, icon: Icon, color, light, delay }: any) {
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
      className="bg-white border-4 border-slate-950 p-8 rounded-[2rem] space-y-8 hover:translate-y-[-8px] hover:shadow-[15px_15px_0px_#0f172a] transition-all duration-500 group relative overflow-hidden shadow-xl"
    >
       <div className={`w-16 h-16 ${color} ${light ? 'text-slate-950' : 'text-white'} rounded-[1.25rem] flex items-center justify-center shadow-lg border-2 border-slate-950 group-hover:rotate-12 transition-transform`}>
          <Icon size={28} />
       </div>
       <div>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-2">{label}</p>
          <p className="text-3xl font-black text-slate-950 font-jakarta tracking-tighter leading-none">
             {typeof val === 'number' && val > 1000 ? (val/1000).toFixed(1) + 'K' : val}
          </p>
       </div>
    </motion.div>
  );
}

function AdmQuickLink({ href, icon: Icon, label }: any) {
  return (
    <Link href={href} className="flex items-center gap-4 p-5 bg-white/5 border-2 border-white/5 rounded-2xl hover:bg-white hover:text-slate-950 hover:border-slate-950 transition-all group shadow-inner">
       <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-slate-950 group-hover:text-white transition-all shadow-md">
          <Icon size={20} />
       </div>
       <span className="text-base font-black flex-1 uppercase tracking-tight">{label}</span>
       <ChevronLeft size={18} className="text-white/20 group-hover:text-slate-950 x-[-4px] transition-transform" />
    </Link>
  );
}

function StatusLine({ label, val }: any) {
  return (
    <div className="flex items-center justify-between p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl group hover:border-slate-950 transition-all shadow-sm">
       <span className="text-sm font-black text-slate-500 group-hover:text-slate-950">{label}</span>
       <span className="text-xl font-black text-slate-950 font-jakarta">{val}</span>
    </div>
  );
}
