"use client";

import { useState, useMemo } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatDate } from "@/lib/formatters";
import { Search, CheckCircle, Clock, AlertCircle, ChevronRight, Package } from "lucide-react";
import { motion } from "framer-motion";

interface Request {
  id: number;
  title: string;
  status: string;
  total?: number;
  createdAt: string;
  client?: { fullName?: string; phone?: string };
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING_ADMIN_REVISION: { label: "قيد المراجعة", color: "bg-amber-50 text-amber-700 border-amber-200" },
  OPEN_FOR_BIDDING:       { label: "مفتوح للعروض", color: "bg-blue-50 text-blue-700 border-blue-200" },
  BIDS_RECEIVED:          { label: "عروض واردة", color: "bg-purple-50 text-purple-700 border-purple-200" },
  OFFERS_FORWARDED:       { label: "عروض محولة", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  ORDER_PAID_PENDING_DELIVERY: { label: "مدفوع - ينتظر التوصيل", color: "bg-orange-50 text-orange-700 border-orange-200" },
  CLOSED_SUCCESS:         { label: "مكتمل", color: "bg-green-50 text-green-700 border-green-200" },
  CLOSED_CANCELLED:       { label: "ملغى", color: "bg-red-50 text-red-700 border-red-200" },
  REJECTED:               { label: "مرفوض", color: "bg-gray-50 text-gray-600 border-gray-200" },
};

export default function AdminRequests() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: requests, loading } = useAsyncData<Request[]>(
    () => apiFetch("/api/admin/requests", "ADMIN"),
    []
  );

  const filtered = useMemo(() => {
    return (requests ?? []).filter((r) => {
      const matchesSearch =
        r.title?.toLowerCase().includes(search.toLowerCase()) ||
        r.client?.fullName?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const getStatus = (s: string) => STATUS_MAP[s] ?? { label: s, color: "bg-gray-50 text-gray-600 border-gray-200" };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900">الطلبات والعمليات</h1>
        <p className="text-gray-500 mt-1 text-sm">متابعة وإدارة جميع طلبات العملاء</p>
      </div>

      <div className="px-8 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "إجمالي الطلبات", value: requests?.length ?? 0, color: "border-r-4 border-orange-400" },
            { label: "قيد المراجعة",   value: requests?.filter(r => r.status === "PENDING_ADMIN_REVISION").length ?? 0, color: "border-r-4 border-amber-400" },
            { label: "مفتوح للعروض",   value: requests?.filter(r => r.status === "OPEN_FOR_BIDDING").length ?? 0, color: "border-r-4 border-blue-400" },
            { label: "مكتمل",          value: requests?.filter(r => r.status === "CLOSED_SUCCESS").length ?? 0, color: "border-r-4 border-green-400" },
          ].map((s) => (
            <div key={s.label} className={`bg-white rounded-xl p-5 shadow-sm ${s.color}`}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{s.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="ابحث عن طلب أو عميل..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none bg-white"
          >
            <option value="all">جميع الحالات</option>
            {Object.entries(STATUS_MAP).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">الطلب</th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">العميل</th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">الحالة</th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">التاريخ</th>
                  <th className="px-6 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-400 font-medium">لا توجد طلبات</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((req, idx) => {
                    const st = getStatus(req.status);
                    return (
                      <motion.tr
                        key={req.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="hover:bg-orange-50/40 transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-4 text-sm font-bold text-gray-400">#{req.id}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-gray-900">{req.title}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
                              {req.client?.fullName?.charAt(0) ?? "؟"}
                            </div>
                            <span className="text-sm text-gray-700">{req.client?.fullName ?? "غير محدد"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${st.color}`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(req.createdAt)}</td>
                        <td className="px-6 py-4">
                          <button className="flex items-center gap-1 text-orange-500 hover:text-orange-700 text-sm font-semibold opacity-0 group-hover:opacity-100 transition">
                            عرض <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {!loading && filtered.length > 0 && (
            <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                عرض <span className="font-semibold text-gray-700">{filtered.length}</span> من <span className="font-semibold text-gray-700">{requests?.length ?? 0}</span> طلب
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
