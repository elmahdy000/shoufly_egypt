"use client";

import { useState, useMemo } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { 
  FiMapPin, 
  FiNavigation, 
  FiTruck, 
  FiBox, 
  FiSearch, 
  FiClock,
  FiCheckCircle,
  FiArrowLeft
} from "react-icons/fi";

export default function AdminTrackingPage() {
  const [filter, setFilter] = useState("ALL");
  
  const { data: liveOrders, loading } = useAsyncData<any[]>(() => 
    apiFetch("/api/admin/tracking/live", "ADMIN"), 
    []
  );

  const stats = useMemo(() => {
    const orders = liveOrders ?? [];
    return {
      active: orders.filter((o: any) => o.status === "قيد التوصيل").length,
      delayed: orders.filter((o: any) => o.status === "متأخر").length,
      available: orders.filter((o: any) => o.status === "بانتظار التحرك").length,
    };
  }, [liveOrders]);

  const filteredOrders = useMemo(() => {
    const orders = liveOrders ?? [];
    if (filter === "ALL") return orders;
    if (filter === "ACTIVE") return orders.filter((p: any) => p.status === "قيد التوصيل");
    if (filter === "PENDING") return orders.filter((p: any) => p.status === "بانتظار التحرك");
    return orders;
  }, [liveOrders, filter]);

  return (
    <div className="p-8 lg:p-12 max-w-[1600px] mx-auto space-y-8 dir-rtl text-right font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">متابعة التوصيل</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">متابعة حركة الطلبات والمناديب لحظياً.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
         {[
           { id: 'ALL', label: 'الكل' },
           { id: 'ACTIVE', label: 'قيد التوصيل' },
           { id: 'PENDING', label: 'منتظر' },
           { id: 'DELAYED', label: 'متأخر' },
         ].map((f) => (
           <button 
             key={f.id}
             onClick={() => setFilter(f.id)}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
               filter === f.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
             }`}
           >
             {f.label}
           </button>
         ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
               <th className="py-3 px-6 text-xs font-semibold text-slate-500">الطلب</th>
               <th className="py-3 px-6 text-xs font-semibold text-slate-500">الحالة</th>
               <th className="py-3 px-6 text-xs font-semibold text-slate-500">المندوب</th>
               <th className="py-3 px-6 text-xs font-semibold text-slate-500">الموقع</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="py-12 text-center text-slate-400 text-sm font-medium">جاري التحميل...</td></tr>
            ) : (filteredOrders ?? []).length === 0 ? (
              <tr><td colSpan={4} className="py-12 text-center text-slate-400 text-sm font-medium">لا توجد طلبات</td></tr>
            ) : (filteredOrders ?? []).map((order: any) => (
              <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                        <FiBox size={18} />
                     </div>
                     <div>
                        <p className="font-semibold text-slate-900">{order.title}</p>
                        <p className="text-xs text-slate-400">#{order.id}</p>
                     </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`text-xs font-medium px-3 py-1 rounded-lg ${
                    order.status === 'قيد التوصيل' ? 'bg-emerald-50 text-emerald-600' : 
                    order.status === 'متأخر' ? 'bg-rose-50 text-rose-600' : 
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <FiTruck size={16} className="text-slate-400" />
                    <p className="text-sm text-slate-700">{order.rider}</p>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <FiMapPin size={16} className="text-slate-400" />
                    <p className="text-sm text-slate-700">{order.location || 'غير معروف'}</p>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
