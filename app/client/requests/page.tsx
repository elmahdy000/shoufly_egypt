"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/shoofly/button";
import { StatusBadge } from "@/components/shoofly/status-badge";
import { ErrorState } from "@/components/shared/error-state";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { listClientRequests } from "@/lib/api/requests";
import { FiPlus, FiBox, FiFolder, FiMapPin, FiClock, FiAlertCircle, FiChevronLeft, FiArrowRight } from "react-icons/fi";

export default function ClientRequestsPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const { data, loading, error } = useAsyncData(() => listClientRequests(), []);

  const rows = useMemo(() => {
    const list = data ?? [];
    if (statusFilter === "ALL") return list;
    return list.filter((item: any) => item.status === statusFilter);
  }, [data, statusFilter]);

  return (
    <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-8 font-sans dir-rtl text-right pb-24 lg:pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Link href="/client" className="text-sm text-slate-500 hover:text-primary flex items-center gap-1 mb-2">
            <FiArrowRight size={14} /> العودة للرئيسية
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FiFolder className="text-primary" /> طلباتي
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">إدارة ومراقبة جميع طلباتك</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-medium outline-none focus:border-primary min-w-[140px]"
          >
            <option value="ALL">جميع الحالات ({data?.length ?? 0})</option>
            <option value="PENDING_ADMIN_REVISION">قيد المراجعة</option>
            <option value="OPEN_FOR_BIDDING">مفتوح للعروض</option>
            <option value="OFFERS_FORWARDED">عروض متاحة</option>
            <option value="CLOSED_SUCCESS">مكتملة</option>
          </select>
          
          <Link href="/client/requests/new">
            <Button className="h-11 px-5 text-sm font-medium gap-2 bg-primary text-white hover:bg-primary/90 rounded-xl">
              <FiPlus size={18} /> طلب جديد
            </Button>
          </Link>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
           <FiBox size={32} className="mb-3 opacity-50 animate-pulse" />
           <p className="text-sm font-medium">جاري التحميل...</p>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && rows.length === 0 && (
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

      {/* Requests Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {rows.map((request: any) => {
          const hasOffers = request.status === 'OFFERS_FORWARDED';
          
          return (
            <Link 
              key={request.id} 
              href={`/client/requests/${request.id}`} 
              className="bg-white rounded-2xl border border-slate-200 p-5 block hover:shadow-md hover:border-primary/30 transition-all group"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 shrink-0">
                    <FiFolder size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 line-clamp-1">
                      {request.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">#{request.id}</p>
                  </div>
                </div>
                {hasOffers && (
                  <span className="shrink-0 text-xs font-medium px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full flex items-center gap-1">
                    <FiAlertCircle size={12} /> عروض جديدة
                  </span>
                )}
              </div>
              
              <p className="text-sm text-slate-500 flex items-center gap-2 mb-4">
                <FiMapPin className="text-slate-400 shrink-0" size={16} /> 
                <span className="truncate">{request.address}</span>
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <StatusBadge 
                   status={hasOffers ? 'pending' : request.status === 'CLOSED_SUCCESS' ? 'completed' : 'active'} 
                   label={hasOffers ? 'عروض متاحة' : request.status === 'PENDING_ADMIN_REVISION' ? 'قيد المراجعة' : request.status === 'OPEN_FOR_BIDDING' ? 'مفتوح' : request.status === 'CLOSED_SUCCESS' ? 'مكتمل' : request.status} 
                />
                <FiChevronLeft className="text-slate-300 group-hover:text-primary group-hover:-translate-x-1 transition-all" size={18} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
