"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { listDeliveryTasks } from "@/lib/api/delivery-agent";
import { motion } from "framer-motion";
import { 
  Package, Map, ArrowLeft, Truck, Navigation, MapPin, Phone, Clock, AlertCircle,
} from "lucide-react";

export default function DeliveryDashboard() {
  const { data, loading, error } = useAsyncData(() => listDeliveryTasks(), []);

  const stats = useMemo(
    () => ({
      available: data?.available.length ?? 0,
      myTasks: data?.myTasks.length ?? 0,
    }),
    [data],
  );

  return (
    <div className="min-h-screen bg-background pb-24 font-sans" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">مشاويري</h1>
                <p className="text-sm text-muted-foreground mt-1">الأوردرات المتاحة والحالية</p>
              </div>
            </div>
            <Link href="/delivery/tasks">
              <button className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition text-sm font-bold flex items-center gap-2">
                <Map className="w-4 h-4" /> تصفح المتاح
              </button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {[
            { label: "أوردراتي الحالية", desc: "اللي معاك في الطريق", value: stats.myTasks, icon: Package, color: "from-cyan-500 to-blue-500" },
            { label: "متاح في منطقتي", desc: "مستني اللي يوصله", value: stats.available, icon: Map, color: "from-amber-500 to-orange-500" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href="/delivery/tasks">
                <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/40 hover:bg-muted/50 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-10 group-hover:bg-opacity-20 transition-colors`}>
                      {stat.icon === Package ? (
                        <Package className="w-5 h-5 text-primary" />
                      ) : (
                        <Map className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mb-2">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-sm text-muted-foreground font-medium">جاري تحميل الأوردرات...</p>
          </div>
        )}

        {error && (
          <div className="p-6 bg-error/10 border border-error/30 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-error shrink-0" />
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {/* Active Tasks Feed */}
        {data?.myTasks && data.myTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 mb-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                أوردرات في الطريق
              </h2>
              <Link href="/delivery/tasks" className="text-sm text-primary hover:text-primary/80 transition">
                عرض الكل
              </Link>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {data.myTasks.map((task: any, idx) => {
                const statusStr = task.deliveryTracking?.[0]?.status ?? "OUT_FOR_DELIVERY";
                const isOutForDelivery = statusStr === "OUT_FOR_DELIVERY";
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      href={`/delivery/tasks/${task.id}`}
                      className="group bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:bg-muted/50 transition-all block"
                    >
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {task.title}
                        </h3>
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full shrink-0 ${
                          isOutForDelivery 
                            ? 'bg-primary/20 text-primary' 
                            : 'bg-warning/20 text-warning'
                        }`}>
                          {isOutForDelivery ? "في الطريق" : "تحت التجهيز"}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <span className="truncate">{task.address}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Phone className="w-4 h-4" />
                          </div>
                          <span dir="ltr">{task.deliveryPhone}</span>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
                          #{task.id}
                        </span>
                        <span className="text-xs font-bold text-primary flex items-center gap-1.5 group-hover:gap-2 transition-all">
                          <Navigation className="w-4 h-4" /> افتح الخريطة
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && stats.available === 0 && stats.myTasks === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-12 text-center"
          >
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">مفيش مشاوير جديدة</h3>
            <p className="text-sm text-muted-foreground">ريّح شوية دلوقتي، هنبلغك أول ما يظهر أوردر جديد في منطقتك.</p>
          </motion.div>
        ) : null}

        {/* Available Tasks CTA */}
        {!loading && stats.available > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/delivery/tasks">
              <div className="group bg-gradient-to-br from-warning/20 to-warning/10 border border-warning/30 rounded-2xl p-6 hover:from-warning/30 hover:to-warning/15 transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-warning/30 rounded-xl flex items-center justify-center text-warning group-hover:bg-warning/40 transition-colors">
                      <Map className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-lg text-foreground block mb-1">اكتشف أوردرات متاحة جنبك</p>
                      <p className="text-sm text-muted-foreground">موجود {stats.available} أوردر تقدر تاخدهم دلوقتي!</p>
                    </div>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-warning transition-colors" />
                </div>
              </div>
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default function DeliveryDashboard() {
  const { data, loading, error } = useAsyncData(() => listDeliveryTasks(), []);

  const stats = useMemo(
    () => ({
      available: data?.available.length ?? 0,
      myTasks: data?.myTasks.length ?? 0,
    }),
    [data],
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24 lg:pb-10 font-sans dir-rtl text-right">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Truck size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">مشاويري</h1>
              <p className="text-sm text-slate-500 font-medium mt-1">الأوردرات المتاحة واللي معاك حالياً</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-8 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/delivery/tasks" className="block">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 p-5 hover:border-primary/30 hover:shadow-2xl transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <Package size={20} />
                </div>
                <p className="text-sm text-slate-600 font-bold">أوردراتي الحالية</p>
              </div>
              <p className="text-3xl font-black text-slate-900">{stats.myTasks}</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">اللي معاك في الطريق</p>
            </div>
          </Link>
          
          <Link href="/delivery/tasks" className="block">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 p-5 hover:border-primary/30 hover:shadow-2xl transition-all group">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <Map size={20} />
                </div>
                <p className="text-sm text-slate-600 font-bold">متاح في منطقتك</p>
              </div>
              <p className="text-3xl font-black text-slate-900">{stats.available}</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">مستني اللي يوصله</p>
            </div>
          </Link>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
             <div className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
             <p className="text-sm font-bold">بيحمل الأوردرات...</p>
          </div>
        )}
        
        {error && <ErrorState message={error} />}

        {/* Active Tasks Feed */}
        {data?.myTasks && data.myTasks.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">أوردرات في الطريق</h2>
              <Link href="/delivery/tasks" className="text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
                عرض الكل <ArrowLeft size={16} />
              </Link>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              {data.myTasks.map((task: any) => {
                const statusStr = task.deliveryTracking?.[0]?.status ?? "OUT_FOR_DELIVERY";
                return (
                  <Link
                    key={task.id}
                    href={`/delivery/tasks/${task.id}`}
                    className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/20 p-5 hover:border-primary/30 outline-none transition-all group block"
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                        {task.title}
                      </h3>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${
                        statusStr === "OUT_FOR_DELIVERY" 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {statusStr === "OUT_FOR_DELIVERY" ? "في الطريق للعميل" : "تحت التجهيز"}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                          <MapPin size={14} className="text-slate-400" />
                        </div>
                        <span className="truncate leading-relaxed">{task.address}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                          <Phone size={14} className="text-slate-400" />
                        </div>
                        <span dir="ltr">{task.deliveryPhone}</span>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">رقم: {task.id}</span>
                      <span className="text-xs font-bold text-primary flex items-center gap-1.5 group-hover:gap-2 transition-all">
                        <Navigation size={14} /> افتح الخريطة
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && stats.available === 0 && stats.myTasks === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 p-12 text-center overflow-hidden relative">
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-50"></div>
             <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400 relative z-10">
               <Package size={32} />
             </div>
             <h3 className="text-lg font-bold text-slate-900 mb-2 relative z-10">مفيش مشواير جديدة</h3>
             <p className="text-sm font-medium text-slate-500 relative z-10">ريّح شوية دلوقتى، هنبلغك أول ما يظهر أوردر جديد في منطقتك.</p>
          </div>
        ) : null}

        {/* Available Tasks Link */}
        {stats.available > 0 && (
          <Link
            href="/delivery/tasks"
            className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/20 p-6 flex items-center justify-between hover:border-amber-300 hover:shadow-2xl transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
                <Map size={24} />
              </div>
              <div>
                <span className="font-bold text-lg text-slate-900 block mb-1">اكتشف أوردرات متاحة جنبك</span>
                <span className="text-sm font-medium text-slate-500">موجود {stats.available} أوردر تقدر تاخدهم دلوقتي!</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
              <ArrowLeft size={20} />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
