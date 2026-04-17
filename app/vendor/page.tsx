"use client";

import Link from "next/link";
import { useMemo } from "react";
import { formatCurrency } from "@/lib/formatters";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { listVendorBids } from "@/lib/api/bids";
import { listVendorTransactions } from "@/lib/api/transactions";
import { motion } from "framer-motion";
import {
  Package, TrendingUp, PlusCircle, CheckCircle, Inbox,
  Zap, Search, ChevronLeft, AlertCircle, Clock,
} from "lucide-react";

export default function VendorHomePage() {
  const { data: bidsData, loading: bidsLoading } = useAsyncData(() => listVendorBids(), []);
  const { data: txData, loading: txLoading } = useAsyncData(() => listVendorTransactions(), []);

  const totalEarnings = useMemo(() => {
    return (txData ?? [])
      .filter((tx: any) => tx.type === "VENDOR_PAYOUT" || tx.type === "REFUND_TO_VENDOR" || tx.type === "SETTLEMENT")
      .reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);
  }, [txData]);

  const activeBidsCount = useMemo(() => {
    return (bidsData ?? []).filter((b: any) => b.status === "PENDING" || b.status === "ACCEPTED_BY_CLIENT").length;
  }, [bidsData]);

  const successRate = useMemo(() => {
    const bids = bidsData ?? [];
    if (bids.length === 0) return 0;
    const won = bids.filter((b: any) => b.status === "ACCEPTED_BY_CLIENT").length;
    return Math.round((won / bids.length) * 100);
  }, [bidsData]);

  return (
    <div className="min-h-screen bg-background pb-24 font-sans" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">لوحة الموردين</h1>
              <p className="text-sm text-muted-foreground mt-1">إدارة العروض والأرباح</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/vendor/earnings">
                <button className="px-4 py-2.5 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> الأرباح
                </button>
              </Link>
              <Link href="/vendor/requests">
                <button className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition text-sm font-bold flex items-center gap-2">
                  <Search className="w-4 h-4" /> تصفح الطلبات
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "الأرباح الإجمالية", value: formatCurrency(totalEarnings), icon: TrendingUp, color: "from-emerald-500 to-teal-500", loading: txLoading },
            { label: "العروض النشطة", value: activeBidsCount, icon: Package, color: "from-cyan-500 to-blue-500", loading: bidsLoading },
            { label: "نسبة النجاح", value: `${successRate}%`, icon: CheckCircle, color: "from-purple-500 to-pink-500", loading: bidsLoading },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-10`}>
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.loading ? "..." : stat.value}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Active Bids List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Inbox className="w-5 h-5 text-primary" />
                آخر عروضك
              </h2>
              <Link href="/vendor/bids" className="text-sm text-primary hover:text-primary/80 transition">
                عرض الكل
              </Link>
            </div>

            {bidsLoading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">جاري التحميل...</p>
              </div>
            ) : (bidsData?.length ?? 0) === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Inbox className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">لا توجد عروض</h3>
                <p className="text-sm text-muted-foreground mb-6">ابدأ بتصفح الطلبات المتاحة</p>
                <Link href="/vendor/requests">
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition">
                    تصفح الطلبات
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {(bidsData ?? []).slice(0, 5).map((bid: any, idx) => {
                  const isAccepted = bid.status === "ACCEPTED_BY_CLIENT";
                  return (
                    <motion.div
                      key={bid.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link
                        href={`/vendor/requests/${bid.requestId}`}
                        className="group p-4 bg-background rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/50 transition-all flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isAccepted ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                          }`}>
                            <Package className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition">
                              طلب #{bid.requestId}
                            </h4>
                            <p className="text-xs text-muted-foreground">{bid.request?.title || "خدمة"}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            isAccepted ? "bg-success/20 text-success" : "bg-warning/20 text-warning"
                          }`}>
                            {isAccepted ? "مقبول" : "انتظار"}
                          </span>
                          <p className="text-sm font-bold text-foreground">{formatCurrency(bid.netPrice || 0)}</p>
                          <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition" />
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-4"
          >
            <h3 className="text-xl font-bold text-foreground mb-4">إجراءات سريعة</h3>
            
            {[
              { label: "تصفح الطلبات", desc: "طلبات جديدة متاحة الآن", icon: Search, href: "/vendor/requests", color: "from-cyan-500 to-blue-500" },
              { label: "الأرباح", desc: "تابع أرباحك وفلوسك", icon: TrendingUp, href: "/vendor/earnings", color: "from-emerald-500 to-teal-500" },
            ].map((action, i) => (
              <Link key={i} href={action.href}>
                <div className="group p-4 bg-card border border-border rounded-xl hover:border-primary/40 hover:bg-muted/50 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} bg-opacity-10 group-hover:bg-opacity-20 transition-colors`}>
                      {action.icon === Search ? <Search className="w-5 h-5 text-primary" /> : <TrendingUp className="w-5 h-5 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-sm">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.desc}</p>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition" />
                  </div>
                </div>
              </Link>
            ))}

            {/* Tip Card */}
            <div className="mt-6 p-5 bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-primary" />
                <p className="text-xs font-medium text-primary">نصيحة اليوم</p>
              </div>
              <h4 className="font-semibold text-foreground text-sm mb-2">كيف تزيد من فرصك؟</h4>
              <p className="text-xs leading-relaxed text-muted-foreground">
                العملاء يفضلون الموردين الذين يقدمون ضمانات قوية وردود سريعة على استفساراتهم.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default function VendorHomePage() {
  const { data: bidsData, loading: bidsLoading } = useAsyncData(() => listVendorBids(), []);
  const { data: txData, loading: txLoading } = useAsyncData(() => listVendorTransactions(), []);

  const totalEarnings = useMemo(() => {
    return (txData ?? [])
      .filter((tx: any) => tx.type === "VENDOR_PAYOUT" || tx.type === "REFUND_TO_VENDOR" || tx.type === "SETTLEMENT")
      .reduce((sum: number, tx: any) => sum + Number(tx.amount), 0);
  }, [txData]);

  const activeBidsCount = useMemo(() => {
    return (bidsData ?? []).filter((b: any) => b.status === "PENDING" || b.status === "ACCEPTED_BY_CLIENT").length;
  }, [bidsData]);

  const successRate = useMemo(() => {
    const bids = bidsData ?? [];
    if (bids.length === 0) return 0;
    const won = bids.filter((b: any) => b.status === "ACCEPTED_BY_CLIENT").length;
    return Math.round((won / bids.length) * 100);
  }, [bidsData]);

  return (
    <div className="font-sans dir-rtl text-right" dir="rtl">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-4 space-y-4">
        {/* Quick Actions */}
        <div className="flex items-center gap-3">
           <Link href="/vendor/requests" className="flex-1">
             <Button className="w-full h-12 rounded-xl font-bold gap-2 bg-primary text-white hover:bg-primary/90 transition-all">
                <FiPlusCircle size={18} /> طلبات السوق
             </Button>
           </Link>
           <Link href="/vendor/earnings" className="flex-1">
             <Button variant="secondary" className="w-full h-12 rounded-xl font-bold gap-2 bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 transition-all">
                <FiTrendingUp size={18} /> أرباحي
             </Button>
           </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Earnings Card */}
          <Link href="/vendor/earnings" className="block">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-primary/30 hover:shadow-md transition-all group h-full">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-semibold text-slate-700">الأرباح</span>
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <FiTrendingUp size={16} />
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium mb-1.5">إجمالي</p>
              <p className="text-base font-bold text-slate-900 truncate">
                {txLoading ? "—" : formatCurrency(totalEarnings)}
              </p>
            </div>
          </Link>

          {/* Active Bids Card */}
          <Link href="/vendor/bids" className="block">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-primary/30 hover:shadow-md transition-all group h-full">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-semibold text-slate-700">العروض</span>
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <FiPackage size={16} />
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium mb-1.5">بتتراجع</p>
              <p className="text-base font-bold text-slate-900">
                {bidsLoading ? "—" : activeBidsCount}
              </p>
            </div>
          </Link>

          {/* Success Rate Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-full">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-semibold text-slate-700">الأداء</span>
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                <FiCheckCircle size={16} />
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium mb-1.5">نسبة النجاح</p>
            <p className="text-base font-bold text-slate-900">
              {successRate}<span className="text-xs text-primary font-bold mr-0.5">%</span>
            </p>
          </div>
        </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Active Bids List */}
        <div className="lg:col-span-3 space-y-3">
           <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                 <FiInbox size={16} className="text-primary" /> أخر عروضك
              </h2>
              <Link href="/vendor/bids" className="text-xs font-semibold text-slate-500 hover:text-primary transition-colors">عرض الكل</Link>
           </div>

           <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {bidsLoading ? (
                <div className="p-8 text-center text-slate-500">
                   <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                   <p className="text-xs font-medium">بنحمل...</p>
                </div>
              ) : (bidsData?.length ?? 0) === 0 ? (
                <div className="p-8 text-center">
                   <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-400">
                      <FiInbox size={20} />
                   </div>
                   <p className="text-sm font-semibold text-slate-700 mb-1">مفيش عروض</p>
                   <p className="text-xs text-slate-500 mb-3">ابدأ بتصفح الطلبات المتاحة</p>
                   <Link href="/vendor/requests">
                      <Button variant="secondary" className="text-xs h-8 px-4">تصفح الطلبات</Button>
                   </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                   {(bidsData ?? []).slice(0, 5).map((bid: any) => {
                     const isAccepted = bid.status === "ACCEPTED_BY_CLIENT";
                     return (
                       <Link key={bid.id} href={`/vendor/requests/${bid.requestId}`} className="group p-4 flex items-center justify-between hover:bg-slate-50 transition-all">
                          <div className="flex items-center gap-3">
                             <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                               isAccepted ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                             }`}>
                                <FiPackage size={16} />
                             </div>
                             <div>
                                <h4 className="font-semibold text-sm text-slate-900 group-hover:text-primary transition-colors">طلب #{bid.requestId}</h4>
                                <p className="text-xs text-slate-500 mt-0.5">{bid.request?.title || "طلب خدمة"}</p>
                             </div>
                          </div>
                          
                          <div className="text-left flex items-center gap-3">
                             <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                               isAccepted ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                             }`}>
                               {isAccepted ? "مقبول" : "انتظار"}
                             </span>
                             <p className="text-sm font-bold text-slate-900">{formatCurrency(bid.netPrice || 0)}</p>
                             <FiChevronLeft size={14} className="text-slate-400" />
                          </div>
                       </Link>
                     );
                   })}
                </div>
              )}
           </div>
        </div>

        {/* Quick Links */}
        <div className="lg:col-span-2 space-y-4">
           <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <FiZap size={16} className="text-primary" /> إجراءات سريعة
           </h2>
           
           <div className="grid gap-3">
              <Link href="/vendor/requests" className="bg-white p-4 rounded-xl border border-slate-200 hover:border-primary/30 hover:shadow-sm group flex items-center gap-3 transition-all">
                 <div className="w-10 h-10 bg-orange-50 text-primary rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                    <FiSearch size={17} />
                 </div>
                 <div className="flex-1">
                    <p className="font-semibold text-sm text-slate-900">تصفح الطلبات</p>
                    <p className="text-xs text-slate-500">طلبات جديدة نزلت دلوقتي</p>
                 </div>
                 <FiChevronLeft size={16} className="text-slate-400" />
              </Link>

              <Link href="/vendor/earnings" className="bg-white p-4 rounded-xl border border-slate-200 hover:border-primary/30 hover:shadow-sm group flex items-center gap-3 transition-all">
                 <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0">
                    <FiTrendingUp size={17} />
                 </div>
                 <div className="flex-1">
                    <p className="font-semibold text-sm text-slate-900">الأرباح</p>
                    <p className="text-xs text-slate-500">تابع أرباحك وفلوسك</p>
                 </div>
                 <FiChevronLeft size={16} className="text-slate-400" />
              </Link>
           </div>

           {/* Tip Card */}
           <div className="bg-slate-900 p-4 rounded-xl text-white">
              <div className="flex items-center gap-2 mb-2">
                 <FiZap size={14} className="text-primary" />
                 <p className="text-xs font-bold">نصيحة اليوم</p>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                 العملاء دايمًا بيحبوا التفاصيل ويفضل تديهم ضمان ميقلش عن 3 شهور.
              </p>
           </div>
        </div>
      </div>
    </div>
  </div>
  );
}
