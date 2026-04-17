"use client";

import Link from "next/link";
import { useMemo } from "react";
import { StatCard } from "@/components/shoofly/stat-card";
import { Button } from "@/components/shoofly/button";
import { StatusBadge } from "@/components/shoofly/status-badge";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { listClientRequests } from "@/lib/api/requests";
import { formatCurrency } from "@/lib/formatters";
import { StatSkeleton, RequestSkeleton } from "@/components/shoofly/skeleton";
import { 
  FiPlus, 
  FiGrid, 
  FiArrowLeft, 
  FiClock,
  FiMessageSquare,
  FiAlertCircle,
  FiCheckCircle, 
  FiBox,
  FiMapPin,
  FiTrendingUp,
  FiDollarSign,
  FiPackage,
  FiCornerDownLeft
} from "react-icons/fi";

export default function ClientHomePage() {
  const { data, loading, error } = useAsyncData(() => listClientRequests(), []);

  const stats = useMemo(() => {
    const rows = data ?? [];
    return {
      total: rows.length,
      open: rows.filter((r: any) => ["OPEN_FOR_BIDDING", "OFFERS_FORWARDED"].includes(r.status)).length,
      completed: rows.filter((r: any) => r.status === "CLOSED_SUCCESS").length,
      hasOffers: rows.filter((r: any) => r.status === "OFFERS_FORWARDED").length,
    };
  }, [data]);

  return (
    <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-8 font-sans dir-rtl text-right pb-24 lg:pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">لوحة التحكم</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">تابع طلباتك وإدارة حسابك</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/client/wallet">
            <Button variant="secondary" className="h-11 px-4 text-sm font-medium gap-2">
              <FiDollarSign size={16} /> المحفظة
            </Button>
          </Link>
          <Link href="/client/requests/new">
            <Button className="h-11 px-6 text-sm font-medium gap-2 bg-primary text-white hover:bg-primary/90">
              <FiPlus size={16} /> طلب جديد
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                  <FiGrid size={20} />
                </div>
                <p className="text-xs text-slate-500 font-medium">كل الطلبات</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <FiClock size={20} />
                </div>
                <p className="text-xs text-slate-500 font-medium">قيد التنفيذ</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.open}</p>
            </div>
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                  <FiCheckCircle size={20} />
                </div>
                <p className="text-xs text-slate-500 font-medium">مكتملة</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.completed}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md border-b-primary/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                  <FiTrendingUp size={20} />
                </div>
                <p className="text-xs text-slate-500 font-medium">عروض جديدة</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stats.hasOffers}</p>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Requests */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">أحدث الطلبات</h2>
            <Link href="/client/requests">
              <Button variant="ghost" className="text-sm font-medium text-primary hover:text-primary/80 gap-1">
                عرض الكل <FiArrowLeft size={14} />
              </Button>
            </Link>
          </div>

          {loading && (
            <div className="space-y-3">
              <RequestSkeleton />
              <RequestSkeleton />
              <RequestSkeleton />
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-3">
            {(data ?? []).slice(0, 5).map((request: any) => {
              const hasOffers = request.status === 'OFFERS_FORWARDED';
              return (
                <Link 
                  key={request.id} 
                  href={`/client/requests/${request.id}`} 
                  className="bg-white rounded-2xl border border-slate-200 p-5 block hover:shadow-md hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                          <FiPackage size={16} />
                        </div>
                        <h3 className="font-semibold text-slate-900 truncate">
                          {request.title}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-500 flex items-center gap-2 mb-2">
                        <FiMapPin size={14} className="shrink-0" />
                        <span className="truncate">{request.address}</span>
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">#{request.id}</span>
                        {hasOffers && (
                          <span className="text-xs font-medium px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full">
                            عروض متاحة
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge 
                        status={hasOffers ? 'pending' : request.status === 'CLOSED_SUCCESS' ? 'completed' : 'active'} 
                        label={hasOffers ? 'عروض جديدة' : request.status === 'OPEN_FOR_BIDDING' ? 'مفتوح للعروض' : request.status === 'CLOSED_SUCCESS' ? 'مكتمل' : request.status === 'ORDER_PAID_PENDING_DELIVERY' ? 'جاري التنفيذ' : request.status === 'PENDING_ADMIN_REVISION' ? 'قيد المراجعة' : "طلب نشط"} 
                      />
                      <FiArrowLeft className="text-slate-300 group-hover:text-primary group-hover:-translate-x-1 transition-all" size={18} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {!loading && !error && (data?.length ?? 0) === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                <FiBox size={28} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">لا توجد طلبات</h3>
              <p className="text-sm text-slate-500 mb-6">قم بإنشاء أول طلب لك الآن</p>
              <Link href="/client/requests/new">
                <Button className="bg-primary text-white px-6 py-2.5 text-sm font-medium rounded-xl">
                  إنشاء طلب جديد
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions & Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 pb-2 border-b border-slate-200">
            إجراءات سريعة
          </h2>
          
          <div className="space-y-3">
            <Link href="/client/requests/new" className="bg-white rounded-2xl border border-slate-200 p-4 block hover:shadow-md hover:border-primary/30 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <FiPlus size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 text-sm">طلب خدمة جديدة</p>
                  <p className="text-xs text-slate-500">أضف طلب صيانة أو خدمة</p>
                </div>
                <FiArrowLeft className="text-slate-300" size={16} />
              </div>
            </Link>

            <Link href="/client/wallet" className="bg-white rounded-2xl border border-slate-200 p-4 block hover:shadow-md hover:border-primary/30 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <FiDollarSign size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 text-sm">شحن المحفظة</p>
                  <p className="text-xs text-slate-500">أضف رصيد لدفع الطلبات</p>
                </div>
                <FiArrowLeft className="text-slate-300" size={16} />
              </div>
            </Link>

            <Link href="/client/requests" className="bg-white rounded-2xl border border-slate-200 p-4 block hover:shadow-md hover:border-primary/30 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <FiClock size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 text-sm">طلباتي</p>
                  <p className="text-xs text-slate-500">عرض جميع الطلبات</p>
                </div>
                <FiArrowLeft className="text-slate-300" size={16} />
              </div>
            </Link>

            <Link href="/client/chat" className="bg-white rounded-2xl border border-slate-200 p-4 block hover:shadow-md hover:border-primary/30 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600 group-hover:bg-violet-500 group-hover:text-white transition-colors">
                  <FiMessageSquare size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 text-sm">المحادثات</p>
                  <p className="text-xs text-slate-500">رسائلك مع التجار</p>
                </div>
                <FiArrowLeft className="text-slate-300" size={16} />
              </div>
            </Link>

            <Link href="/client/complaints" className="bg-white rounded-2xl border border-slate-200 p-4 block hover:shadow-md hover:border-rose-200 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                  <FiAlertCircle size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 text-sm">تقديم شكوى</p>
                  <p className="text-xs text-slate-500">الإبلاغ عن مشكلة</p>
                </div>
                <FiArrowLeft className="text-slate-300" size={16} />
              </div>
            </Link>
          </div>

          {/* Tip Card */}
          <div className="bg-primary rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <FiTrendingUp size={16} />
              </div>
              <p className="text-xs font-medium opacity-90">نصيحة اليوم</p>
            </div>
            <h4 className="font-semibold text-sm mb-2">كيف تحصل على أفضل العروض؟</h4>
            <p className="text-xs leading-relaxed opacity-90">
              اكتب وصفاً تفصيلياً لمشكلتك وأضف صور واضحة. الموردون يفضلون الطلبات المفصلة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
