"use client";

import Link from "next/link";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { listPendingAdminRequests } from "@/lib/api/requests";
import {
  Package, ChevronLeft, Activity, AlertCircle
} from "lucide-react";

interface Request {
  id: number;
  title: string;
  status: string;
  _count?: { bids: number };
}

export default function AdminBidsPage() {
  const { data, loading, error } = useAsyncData<Request[]>(() => listPendingAdminRequests(), []);

  return (
    <div className="admin-page" dir="rtl">
      
      {/* 🚀 Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 shadow-inner">
                 <Activity size={22} />
              </div>
              <div>
                 <h1 className="text-2xl font-black text-slate-900 tracking-tight">مركز العروض</h1>
                 <p className="text-xs font-bold text-slate-400 tracking-wide mt-1">متابعة حركة العروض</p>
              </div>
           </div>
        </div>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4">
         <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
         <p className="text-sm font-bold text-amber-800 leading-relaxed">
            ملاحظة: هذه الصفحة تعرض نظرة بانورامية على حركة العروض للطلبات المعلقة. لإدارة أو اعتماد عرض معين، يرجى الانتقال إلى صفحة تفاصيل الطلب مباشرة.
         </p>
      </div>

      <div className="glass-card overflow-hidden">
         <div className="overflow-x-auto">
            <table className="data-table">
               <thead>
                  <tr>
                     <th>الطلب النشط</th>
                     <th className="text-center">عدد العروض</th>
                     <th className="text-center">حالة الطلب</th>
                     <th className="text-left">الإجراء</th>
                  </tr>
               </thead>
               <tbody>
                  {loading ? (
                    Array(5).fill(0).map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={4} className="h-16 bg-slate-50/50" /></tr>)
                  ) : error ? (
                    <tr><td colSpan={4} className="py-20 text-center text-rose-500 font-bold italic">{error}</td></tr>
                  ) : !data || data.length === 0 ? (
                    <tr><td colSpan={4} className="py-20 text-center text-slate-400 font-bold italic bg-slate-50/20">لا توجد عروض قيد الانتظار حالياً</td></tr>
                  ) : (
                    data.map((req) => (
                      <tr key={req.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td>
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                 <Package size={18} />
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-slate-900 leading-none mb-1.5">{req.title}</p>
                                 <span className="text-xs font-black text-slate-400 tracking-tighter">REQ_ID: {req.id}</span>
                              </div>
                           </div>
                        </td>
                        <td className="text-center">
                           <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 border border-orange-100 rounded-full text-xs font-black">
                              {req._count?.bids || 0} عرض
                           </div>
                        </td>
                        <td className="text-center">
                           <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${
                             req.status === 'OPEN' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                             req.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                             'bg-slate-50 text-slate-500 border-slate-100'
                           }`}>
                              <span className={`w-1 h-1 rounded-full ${
                                req.status === 'OPEN' ? 'bg-emerald-600' :
                                req.status === 'PENDING' ? 'bg-amber-600' :
                                'bg-slate-500'
                              }`} />
                              {req.status === 'OPEN' ? 'مفتوح' : req.status === 'PENDING' ? 'قيد المراجعة' : req.status}
                           </div>
                        </td>
                        <td className="text-left">
                           <Link
                             href={`/admin/requests/${req.id}`}
                             className="h-9 px-4 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-600 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-2"
                           >
                              التفاصيل والاعتماد <ChevronLeft size={14} />
                           </Link>
                        </td>
                      </tr>
                    ))
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}


