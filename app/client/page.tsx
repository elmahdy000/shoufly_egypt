"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { listClientRequests } from "@/lib/api/requests";
import { formatCurrency } from "@/lib/formatters";
import { Plus, Clock, DollarSign, Package, MapPin, ArrowLeft, MessageSquare, AlertCircle } from "lucide-react";

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
    <div className="min-h-screen bg-slate-50 pb-24 font-sans" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">لوحة التحكم</h1>
              <p className="text-sm text-slate-500 mt-1">تابع طلباتك والعروض الجديدة</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/client/wallet">
                <button className="px-4 py-2.5 rounded-lg bg-slate-100 text-slate-900 hover:bg-slate-200 transition text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> المحفظة
                </button>
              </Link>
              <Link href="/client/requests/new">
                <button className="px-5 py-2.5 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition text-sm font-bold flex items-center gap-2">
                  <Plus className="w-4 h-4" /> طلب جديد
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "كل الطلبات", value: stats.total, icon: Package, color: "bg-blue-500" },
            { label: "قيد التنفيذ", value: stats.open, icon: Clock, color: "bg-amber-500" },
            { label: "مكتملة", value: stats.completed, icon: Package, color: "bg-emerald-500" },
            { label: "عروض جديدة", value: stats.hasOffers, icon: AlertCircle, color: "bg-purple-500" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="bg-white border-2 border-slate-200 rounded-xl p-4 hover:border-cyan-500 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`${stat.color} text-white p-2.5 rounded-lg`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-bold mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{loading ? "..." : stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Requests */}
          <div className="lg:col-span-2 bg-white border-2 border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b-2 border-slate-200 px-6 py-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-cyan-600" />
                  أحدث الطلبات
                </h2>
                <Link href="/client/requests" className="text-sm text-cyan-600 hover:text-cyan-700 font-bold">
                  عرض الكل
                </Link>
              </div>
            </div>

            {loading && (
              <div className="p-12 text-center">
                <p className="text-slate-400 font-bold">جاري تحميل الطلبات...</p>
              </div>
            )}

            {error && (
              <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="divide-y divide-slate-100">
              {(data ?? []).slice(0, 5).map((request: any) => (
                <Link
                  key={request.id}
                  href={`/client/requests/${request.id}`}
                  className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-sm mb-1">{request.title}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {request.address}
                    </p>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:text-cyan-600" />
                </Link>
              ))}

              {!loading && !error && (data?.length ?? 0) === 0 && (
                <div className="p-12 text-center">
                  <Package className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-500 font-bold mb-3">لا توجد طلبات</p>
                  <Link href="/client/requests/new">
                    <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-bold hover:bg-cyan-700">
                      إنشاء طلب جديد
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">إجراءات سريعة</h3>

            {[
              { label: "طلب خدمة جديدة", icon: Plus, href: "/client/requests/new", color: "bg-blue-50 text-blue-600" },
              { label: "شحن المحفظة", icon: DollarSign, href: "/client/wallet", color: "bg-emerald-50 text-emerald-600" },
              { label: "طلباتي", icon: Package, href: "/client/requests", color: "bg-amber-50 text-amber-600" },
              { label: "المحادثات", icon: MessageSquare, href: "/client/chat", color: "bg-purple-50 text-purple-600" },
            ].map((action, i) => {
              const Icon = action.icon;
              return (
                <Link key={i} href={action.href}>
                  <div className="bg-white border-2 border-slate-200 rounded-lg p-4 hover:border-cyan-500 hover:shadow-md transition-all group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`${action.color} p-2.5 rounded-lg`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 text-sm">{action.label}</p>
                      </div>
                      <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:text-cyan-600" />
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Tip Card */}
            <div className="bg-cyan-600 text-white rounded-lg p-5 mt-6">
              <h4 className="font-bold mb-2 text-sm">نصيحة اليوم</h4>
              <p className="text-xs leading-relaxed opacity-90">
                اكتب وصفاً تفصيلياً لمشكلتك وأضف صور واضحة. الموردون يفضلون الطلبات المفصلة.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
