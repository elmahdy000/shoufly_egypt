"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/shoofly/button";
import { ErrorState } from "@/components/shared/error-state";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { listVendorOpenRequests } from "@/lib/api/requests";
import { 
  FiBriefcase, FiMapPin, FiClock, 
  FiFilter
} from "react-icons/fi";

export default function VendorRequestsPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const { data, loading, error } = useAsyncData(() => listVendorOpenRequests(), []);

  const rows = useMemo(() => {
    const list = data ?? [];
    if (statusFilter === "ALL") return list;
    return list.filter((item: any) => item.status === statusFilter);
  }, [data, statusFilter]);

  return (
    <div className="font-sans dir-rtl text-right">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-4 space-y-4">
        {/* Filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <FiFilter className="absolute right-4 top-1/2 -translate-y-1/2 text-[#767684]" size={18} />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white border border-[#E7E7E7] pl-4 pr-12 py-3 rounded-xl text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 appearance-none"
            >
              <option value="ALL">كل الفرص ({data?.length ?? 0})</option>
              <option value="OPEN_FOR_BIDDING">طلبات جديدة</option>
              <option value="BIDS_RECEIVED">طلبات قيد التفاوض</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-[#767684]">
             <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
             <p className="text-sm font-medium">جاري تحميل الفرص...</p>
          </div>
        )}
        
        {error && <ErrorState message={error} />}

        {!loading && !error && rows.length === 0 && (
          <div className="bg-white rounded-xl border border-[#E7E7E7] shadow-sm p-8 text-center">
             <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-400">
               <FiBriefcase size={18} />
             </div>
             <h3 className="text-sm font-semibold text-[#0F1111] mb-1">لا توجد طلبات</h3>
             <p className="text-xs text-[#565959]">سيصلك تنبيه فور ظهور فرصة جديدة</p>
          </div>
        )}

        {/* Opportunities Feed */}
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((request: any) => {
            const isOpen = request.status === 'OPEN_FOR_BIDDING';

            return (
              <div 
                key={request.id} 
                className="bg-white rounded-2xl border border-[#E7E7E7] shadow-sm p-5 hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-primary">طلب جديد</span>
                    <h3 className="font-semibold text-sm text-[#0F1111] group-hover:text-primary transition-colors line-clamp-1 mt-1">
                      {request.title}
                    </h3>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${
                    isOpen ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isOpen ? 'متاح' : 'مكتفي'}
                  </span>
                </div>

                <p className="text-xs text-[#565959] line-clamp-2 mb-3">
                  {request.description || "لا يوجد وصف تفصيلي"}
                </p>

                <div className="flex items-center gap-2 text-xs text-[#565959] mb-3">
                  <FiMapPin size={14} className="text-[#767684] shrink-0" />
                  <span className="truncate">{request.address}</span>
                </div>
                
                <Link href={`/vendor/requests/${request.id}`}>
                  <Button 
                    className={`w-full h-10 text-sm ${
                      isOpen ? 'bg-primary text-white' : 'bg-slate-100 text-[#0F1111]'
                    }`}
                  >
                    {isOpen ? 'تقديم عرض' : 'التفاصيل'}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
