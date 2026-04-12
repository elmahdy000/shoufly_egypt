"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/shoofly/button";
import { formatCurrency } from "@/lib/formatters";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { listVendorBids } from "@/lib/api/bids";
import { listVendorTransactions } from "@/lib/api/transactions";
import { 
  FiPackage, 
  FiTrendingUp, FiPlusCircle,
  FiCheckCircle, FiInbox,
  FiZap, FiSearch, FiChevronLeft
} from "react-icons/fi";

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
    <div className="font-sans dir-rtl text-right">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-4 space-y-4">
        {/* Quick Actions */}
        <div className="flex items-center gap-3">
           <Link href="/vendor/requests" className="flex-1">
             <Button className="w-full h-12 rounded-xl font-bold gap-2 bg-primary text-white hover:bg-primary/90 transition-all">
                <FiPlusCircle size={18} /> عروض السوق
             </Button>
           </Link>
           <Link href="/vendor/earnings" className="flex-1">
             <Button variant="secondary" className="w-full h-12 rounded-xl font-bold gap-2 bg-white border border-[#E7E7E7] text-[#0F1111] hover:bg-slate-50 transition-all">
                <FiTrendingUp size={18} /> أرباحي
             </Button>
           </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {/* Earnings Card */}
          <Link href="/vendor/earnings" className="block">
            <div className="bg-white rounded-xl border border-[#E7E7E7] shadow-sm p-4 hover:border-primary/30 hover:shadow-md transition-all group h-full">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs text-[#0F1111] font-medium">الأرباح</span>
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <FiTrendingUp size={16} />
                </div>
              </div>
              <p className="text-[10px] text-[#565959] font-medium mb-1">إجمالي</p>
              <p className="text-lg font-bold text-[#0F1111] truncate">
                {txLoading ? "..." : formatCurrency(totalEarnings)}
              </p>
            </div>
          </Link>

          {/* Active Bids Card */}
          <Link href="/vendor/bids" className="block">
            <div className="bg-white rounded-xl border border-[#E7E7E7] shadow-sm p-4 hover:border-primary/30 hover:shadow-md transition-all group h-full">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs text-[#0F1111] font-medium">العروض</span>
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <FiPackage size={16} />
                </div>
              </div>
              <p className="text-[10px] text-[#565959] font-medium mb-1">قيد المراجعة</p>
              <p className="text-lg font-bold text-[#0F1111]">
                {bidsLoading ? "..." : activeBidsCount}
              </p>
            </div>
          </Link>

          {/* Success Rate Card */}
          <div className="bg-white rounded-xl border border-[#E7E7E7] shadow-sm p-4 h-full">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs text-[#0F1111] font-medium">الأداء</span>
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                <FiCheckCircle size={16} />
              </div>
            </div>
            <p className="text-[10px] text-[#565959] font-medium mb-1">نسبة النجاح</p>
            <p className="text-lg font-bold text-[#0F1111]">
              {successRate}<span className="text-xs text-primary font-bold mr-1">%</span>
            </p>
          </div>
        </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Active Bids List */}
        <div className="lg:col-span-3 space-y-3">
           <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-[#0F1111] flex items-center gap-2">
                 <FiInbox size={16} className="text-primary" /> العروض الأخيرة
              </h2>
              <Link href="/vendor/bids" className="text-[10px] font-medium text-[#767684] hover:text-primary transition-colors">الكل</Link>
           </div>

           <div className="bg-white rounded-xl border border-[#E7E7E7] shadow-sm overflow-hidden">
              {bidsLoading ? (
                <div className="p-8 text-center text-[#767684]">
                   <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                   <p className="text-xs">جاري التحميل...</p>
                </div>
              ) : (bidsData?.length ?? 0) === 0 ? (
                <div className="p-8 text-center">
                   <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-400">
                      <FiInbox size={20} />
                   </div>
                   <p className="text-sm text-[#565959] font-medium mb-2">لا توجد عروض</p>
                   <Link href="/vendor/requests">
                      <Button variant="secondary" className="text-xs h-8 px-4">تصفح الطلبات</Button>
                   </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#E7E7E7]">
                   {(bidsData ?? []).slice(0, 5).map((bid: any) => {
                     const isAccepted = bid.status === "ACCEPTED_BY_CLIENT";
                     return (
                       <Link key={bid.id} href={`/vendor/requests/${bid.requestId}`} className="group p-4 flex items-center justify-between hover:bg-slate-50 transition-all">
                          <div className="flex items-center gap-3">
                             <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                               isAccepted ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                             }`}>
                                <FiPackage size={16} />
                             </div>
                             <div>
                                <h4 className="font-medium text-sm text-[#0F1111] group-hover:text-primary transition-colors">طلب #{bid.requestId}</h4>
                                <p className="text-[10px] text-[#767684]">{bid.request?.title || "طلب صيانة"}</p>
                             </div>
                          </div>
                          
                          <div className="text-left">
                             <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                               isAccepted ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                             }`}>
                               {isAccepted ? "مقبول" : "قيد المراجعة"}
                             </span>
                             <p className="text-sm font-bold text-[#0F1111] mt-1">{formatCurrency(bid.netPrice || 0).split(' ')[0]}</p>
                          </div>
                       </Link>
                     )
                   })}
                </div>
              )}
           </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
           <h2 className="text-sm font-bold text-[#0F1111] flex items-center gap-2 mb-3">
              <FiZap size={16} className="text-primary" /> إجراءات سريعة
           </h2>
           
           <div className="grid gap-3">
              <Link href="/vendor/requests" className="bg-white p-3 rounded-xl border border-[#E7E7E7] hover:border-primary/30 hover:shadow-sm group flex items-center gap-3 transition-all">
                 <div className="w-9 h-9 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <FiSearch size={16} />
                 </div>
                 <div className="flex-1">
                    <p className="font-medium text-xs text-[#0F1111]">تصفح الطلبات</p>
                    <p className="text-[10px] text-[#767684]">فرص جديدة متاحة</p>
                 </div>
                 <FiChevronLeft size={16} className="text-[#E7E7E7]" />
              </Link>

              <Link href="/vendor/earnings" className="bg-white p-3 rounded-xl border border-[#E7E7E7] hover:border-primary/30 hover:shadow-sm group flex items-center gap-3 transition-all">
                 <div className="w-9 h-9 bg-emerald-50 text-emerald-500 rounded-lg flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <FiTrendingUp size={16} />
                 </div>
                 <div className="flex-1">
                    <p className="font-medium text-xs text-[#0F1111]">الأرباح</p>
                    <p className="text-[10px] text-[#767684]">راجع تدفقاتك المالية</p>
                 </div>
                 <FiChevronLeft size={16} className="text-[#E7E7E7]" />
              </Link>
           </div>

           {/* Tip Card */}
           <div className="bg-primary p-4 rounded-xl text-white">
              <div className="flex items-center gap-2 mb-2">
                 <FiZap size={14} />
                 <p className="text-[10px] font-medium">نصيحة</p>
              </div>
              <p className="text-xs font-medium text-white/90 leading-relaxed">
                 العملاء يفضلون العروض التفصيلية مع ضمان لا يقل عن 3 أشهر
              </p>
           </div>
        </div>
      </div>
    </div>
  </div>
  );
}

