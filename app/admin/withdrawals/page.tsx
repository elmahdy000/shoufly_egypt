"use client";

import { useState, useMemo, useCallback } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { reviewAdminWithdrawal } from "@/lib/api/transactions";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Search, CheckCircle, XCircle, Clock, Landmark, RefreshCw, X } from "lucide-react";

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  PENDING:  { label: "قيد الفحص", cls: "bg-amber-50 text-amber-700 border-amber-200"  },
  APPROVED: { label: "تم الصرف",  cls: "bg-green-50 text-green-700 border-green-200"  },
  REJECTED: { label: "مرفوض",     cls: "bg-red-50 text-red-700 border-red-200"         },
};

const FILTERS = [
  { key: "ALL",      label: "الكل"      },
  { key: "PENDING",  label: "قيد الفحص" },
  { key: "APPROVED", label: "تم الصرف"  },
  { key: "REJECTED", label: "مرفوض"     },
];

export default function AdminWithdrawalsPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch]             = useState("");
  const [selected, setSelected]         = useState<any>(null);
  const [rejectNote, setRejectNote]     = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMsg, setActionMsg]       = useState<{ text: string; ok: boolean } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: withdrawals, loading, setData, refresh } = useAsyncData<any[]>(
    () => apiFetch("/api/admin/withdrawals", "ADMIN"),
    []
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 500);
  }, [refresh]);

  const stats = useMemo(() => {
    const all = withdrawals ?? [];
    return {
      total:    all.length,
      pending:  all.filter((w: any) => w.status === "PENDING").length,
      approved: all.filter((w: any) => w.status === "APPROVED").length,
      rejected: all.filter((w: any) => w.status === "REJECTED").length,
      pendingAmount: all.filter((w: any) => w.status === "PENDING").reduce((s: number, w: any) => s + Number(w.amount), 0),
    };
  }, [withdrawals]);

  const filtered = useMemo(() => {
    let list = withdrawals ?? [];
    if (statusFilter !== "ALL") list = list.filter((w: any) => w.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((w: any) =>
        w.vendor?.fullName?.toLowerCase().includes(q) ||
        String(w.id).includes(q)
      );
    }
    return list;
  }, [withdrawals, statusFilter, search]);

  async function handleAction(wId: number, action: "APPROVED" | "REJECTED") {
    setActionLoading(`${action}-${wId}`);
    setActionMsg(null);
    try {
      await reviewAdminWithdrawal(wId, action, rejectNote);
      setData(prev => (prev ?? []).map((w: any) =>
        w.id === wId ? { ...w, status: action } : w
      ));
      setActionMsg({ text: action === "APPROVED" ? "تم قبول طلب السحب" : "تم رفض طلب السحب", ok: action === "APPROVED" });
      if (selected?.id === wId) setSelected((prev: any) => ({ ...prev, status: action }));
      setRejectNote("");
    } catch (err: any) {
      setActionMsg({ text: err.message ?? "حدث خطأ", ok: false });
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">طلبات السحب</h1>
          <p className="text-sm text-gray-500 mt-1">مراجعة واعتماد طلبات صرف المستحقات للموردين</p>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
        >
          <RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} />
          تحديث
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "إجمالي الطلبات",    value: stats.total,    icon: Landmark,     bg: "bg-gray-50",   cls: "text-gray-600"   },
          { label: "قيد الفحص",         value: stats.pending,  icon: Clock,        bg: "bg-amber-50",  cls: "text-amber-600"  },
          { label: "تم الصرف",          value: stats.approved, icon: CheckCircle,  bg: "bg-green-50",  cls: "text-green-600"  },
          { label: "مبالغ منتظرة",      value: formatCurrency(stats.pendingAmount), icon: Landmark, bg: "bg-orange-50", cls: "text-orange-600" },
        ].map(({ label, value, icon: Icon, bg, cls }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center ${cls} shrink-0`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">{label}</p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                statusFilter === f.key
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث..."
            className="w-full pr-9 pl-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>
      </div>

      {/* Feedback */}
      {actionMsg && (
        <div className={`flex items-center gap-2 p-3.5 border rounded-lg text-sm font-medium ${actionMsg.ok ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {actionMsg.ok ? <CheckCircle size={15} /> : <XCircle size={15} />}
          {actionMsg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Table */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">المورد</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">المبلغ</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">الحالة</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">التاريخ</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={5} className="px-4 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : !filtered.length ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-14 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                            <Landmark size={18} className="text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-500">لا توجد طلبات سحب</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((w: any) => {
                      const st = STATUS_MAP[w.status] ?? { label: w.status, cls: "bg-gray-100 text-gray-600 border-gray-200" };
                      return (
                        <tr
                          key={w.id}
                          onClick={() => setSelected(selected?.id === w.id ? null : w)}
                          className={`hover:bg-gray-50 transition-colors cursor-pointer ${selected?.id === w.id ? "bg-orange-50/50" : ""}`}
                        >
                          <td className="px-4 py-3">
                            <p className="text-sm font-semibold text-gray-900">{w.vendor?.fullName ?? "—"}</p>
                            <p className="text-xs text-gray-400">#{w.id}</p>
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-gray-900">{formatCurrency(w.amount)}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${st.cls}`}>
                              {st.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">{formatDate(w.createdAt)}</td>
                          <td className="px-4 py-3 text-left">
                            {w.status === "PENDING" && (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={e => { e.stopPropagation(); handleAction(w.id, "APPROVED"); }}
                                  disabled={!!actionLoading}
                                  className="p-1.5 text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                                >
                                  <CheckCircle size={14} />
                                </button>
                                <button
                                  onClick={e => { e.stopPropagation(); setSelected(w); }}
                                  disabled={!!actionLoading}
                                  className="p-1.5 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                                >
                                  <XCircle size={14} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">تفاصيل الطلب #{selected.id}</h3>
              <button onClick={() => setSelected(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-3">
                {[
                  { label: "المورد",   value: selected.vendor?.fullName ?? "—" },
                  { label: "المبلغ",   value: formatCurrency(selected.amount)   },
                  { label: "التاريخ",  value: formatDate(selected.createdAt)    },
                  { label: "IBAN",     value: selected.iban ?? "—"              },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-xs font-medium text-gray-500">{label}</span>
                    <span className="text-sm font-semibold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>

              {selected.status === "PENDING" && (
                <div className="space-y-3 pt-2">
                  <textarea
                    value={rejectNote}
                    onChange={e => setRejectNote(e.target.value)}
                    placeholder="سبب الرفض (اختياري)..."
                    rows={3}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(selected.id, "APPROVED")}
                      disabled={!!actionLoading}
                      className="flex-1 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {actionLoading === `APPROVED-${selected.id}` ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle size={14} />}
                      قبول
                    </button>
                    <button
                      onClick={() => handleAction(selected.id, "REJECTED")}
                      disabled={!!actionLoading}
                      className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {actionLoading === `REJECTED-${selected.id}` ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <XCircle size={14} />}
                      رفض
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
