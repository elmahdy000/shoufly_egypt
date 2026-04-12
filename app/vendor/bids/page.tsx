"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ErrorState } from "@/components/shared/error-state";
import { listVendorBids } from "@/lib/api/bids";
import { formatCurrency } from "@/lib/formatters";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { 
  FiTrendingUp, 
  FiMessageSquare,
  FiPackage,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiSearch
} from "react-icons/fi";

export default function VendorBidsPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const { data, loading, error } = useAsyncData(() => listVendorBids(), []);

  const rows = useMemo(() => {
    const list = data ?? [];
    if (statusFilter === "ALL") return list;
    return list.filter((item: any) => item.status === statusFilter);
  }, [data, statusFilter]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ACCEPTED_BY_CLIENT':
        return { 
          label: 'تم القبول', 
          bgColor: 'bg-emerald-50', 
          textColor: 'text-emerald-600',
          icon: FiCheckCircle
        };
      case 'SELECTED':
        return { 
          label: 'مرشح للعميل', 
          bgColor: 'bg-primary/10', 
          textColor: 'text-primary',
          icon: FiPackage
        };
      case 'PENDING':
        return { 
          label: 'قيد المراجعة', 
          bgColor: 'bg-amber-50', 
          textColor: 'text-amber-600',
          icon: FiClock
        };
      case 'REJECTED':
        return { 
          label: 'مرفوض', 
          bgColor: 'bg-rose-50', 
          textColor: 'text-rose-600',
          icon: FiXCircle
        };
      default:
        return { 
          label: 'قيد المراجعة', 
          bgColor: 'bg-slate-50', 
          textColor: 'text-slate-600',
          icon: FiClock
        };
    }
  };

  return (
    <div className="font-sans dir-rtl text-right">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-4 space-y-4">
        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg border border-[#E7E7E7] p-3 text-center">
            <p className="text-[10px] text-[#565959] font-medium mb-0.5">الكل</p>
            <p className="text-lg font-bold text-[#0F1111]">{data?.length ?? 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#E7E7E7] p-3 text-center">
            <p className="text-[10px] text-[#565959] font-medium mb-0.5">مقبولة</p>
            <p className="text-lg font-bold text-emerald-600">
              {data?.filter((b: any) => b.status === 'ACCEPTED_BY_CLIENT').length ?? 0}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-[#E7E7E7] p-3 text-center">
            <p className="text-[10px] text-[#565959] font-medium mb-0.5">قيد المراجعة</p>
            <p className="text-lg font-bold text-amber-600">
              {data?.filter((b: any) => b.status === 'PENDING' || b.status === 'SELECTED').length ?? 0}
            </p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-[200px]">
            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-[#767684]" size={16} />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-white border border-[#E7E7E7] pl-3 pr-10 py-2.5 rounded-lg text-xs font-medium outline-none focus:border-primary appearance-none"
            >
              <option value="ALL">الكل ({data?.length ?? 0})</option>
              <option value="PENDING">قيد الانتظار</option>
              <option value="SELECTED">بانتظار الموافقة</option>
              <option value="ACCEPTED_BY_CLIENT">مقبولة</option>
              <option value="REJECTED">مرفوضة</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-[#767684]">
             <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
             <p className="text-sm font-medium">جاري تحميل العروض...</p>
          </div>
        )}
        
        {error && <ErrorState message={error} />}

        {!loading && !error && rows.length === 0 && (
          <div className="bg-white rounded-xl border border-[#E7E7E7] shadow-sm p-8 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-400">
               <FiTrendingUp size={20} />
             </div>
             <h3 className="text-sm font-semibold text-[#0F1111] mb-1">لا توجد عروض</h3>
             <p className="text-xs text-[#565959]">لم تقم بتقديم أي عروض بعد</p>
          </div>
        )}

        {/* Bids List */}
        <div className="grid gap-3">
          {rows.map((bid: any) => {
            const statusConfig = getStatusConfig(bid.status);
            const isAccepted = bid.status === 'ACCEPTED_BY_CLIENT';
            const StatusIcon = statusConfig.icon;

            return (
              <div 
                key={bid.id} 
                className={`bg-white rounded-xl border border-[#E7E7E7] shadow-sm p-4 hover:shadow-sm transition-all ${
                  isAccepted ? 'border-emerald-300' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Icon & Status */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                    <StatusIcon size={16} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-medium text-sm text-[#0F1111] truncate">طلب #{bid.requestId}</p>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="text-xs text-[#565959] line-clamp-1">
                      {bid.description || 'لا يوجد وصف'}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-left shrink-0">
                    <p className={`text-sm font-bold ${isAccepted ? 'text-emerald-600' : 'text-[#0F1111]'}`}>
                      {formatCurrency(bid.netPrice).split(' ')[0]}
                    </p>
                    {isAccepted && (
                      <Link 
                        href={`/vendor/bids/${bid.id}`}
                        className="text-[10px] font-medium text-primary hover:text-primary/80 transition-colors"
                      >
                        التفاصيل
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
