"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { reviewAdminRequest, dispatchAdminRequest } from "@/lib/api/requests";
import {
  FiPackage, FiSearch, FiX, FiMapPin, FiUser,
  FiCheckCircle, FiXCircle, FiTruck, FiChevronLeft,
  FiAlertCircle, FiLoader, FiDollarSign, FiTag, FiCalendar, FiArrowLeft
} from "react-icons/fi";

const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  PENDING:    { label: "قيد المراجعة", color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200" },
  ACTIVE:     { label: "نشط",          color: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-200" },
  ASSIGNED:   { label: "مُكلَّف",       color: "text-violet-700",  bg: "bg-violet-50",  border: "border-violet-200" },
  IN_TRANSIT: { label: "جاري التوصيل", color: "text-indigo-700",  bg: "bg-indigo-50",  border: "border-indigo-200" },
  DELIVERED:  { label: "مُسلَّم",       color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  REJECTED:   { label: "مرفوض",        color: "text-rose-700",    bg: "bg-rose-50",    border: "border-rose-200" },
  REFUNDED:   { label: "مُسترَد",       color: "text-slate-600",   bg: "bg-slate-100",  border: "border-slate-200" },
};

function StatusPill({ status }: { status: string }) {
  const m = STATUS_META[status] ?? { label: status, color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200" };
  return <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${m.bg} ${m.border} ${m.color}`}>{m.label}</span>;
}

export default function AdminRequestsPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const { data: pending, loading: loadingPending } = useAsyncData<any[]>(
    () => apiFetch("/api/admin/requests/pending", "ADMIN"), []
  );
  const { data: all, loading: loadingAll, setData } = useAsyncData<any[]>(
    () => apiFetch("/api/admin/requests", "ADMIN"), []
  );

  const requests = statusFilter === "PENDING" ? (pending ?? []) : (all ?? []);
  const loading = statusFilter === "PENDING" ? loadingPending : loadingAll;

  const filtered = useMemo(() => {
    let list = requests ?? [];
    if (statusFilter !== "ALL" && statusFilter !== "PENDING") {
      list = list.filter((r: any) => r.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r: any) =>
        r.title?.toLowerCase().includes(q) ||
        r.client?.fullName?.toLowerCase().includes(q) ||
        String(r.id).includes(q)
      );
    }
    return list;
  }, [requests, statusFilter, search]);

  const stats = useMemo(() => {
    const a = all ?? [];
    return {
      total: a.length,
      pending: pending?.length ?? 0,
      active: a.filter((r: any) => r.status === "ACTIVE").length,
      delivered: a.filter((r: any) => r.status === "DELIVERED").length,
    };
  }, [all, pending]);

  async function doAction(requestId: number, action: "approve" | "reject" | "dispatch") {
    setActionLoading(action);
    setActionMsg(null);
    try {
      if (action === "approve") await reviewAdminRequest(requestId, "approve");
      else if (action === "reject") await reviewAdminRequest(requestId, "reject");
      else await dispatchAdminRequest(requestId);

      const newStatus = action === "approve" ? "ACTIVE" : action === "reject" ? "REJECTED" : "IN_TRANSIT";
      setData((prev: any[]) => (prev ?? []).map((r) => r.id === requestId ? { ...r, status: newStatus } : r));
      setSelected((prev: any) => prev?.id === requestId ? { ...prev, status: newStatus } : prev);
      setActionMsg({ text: "تم تنفيذ الإجراء بنجاح ✓", ok: true });
    } catch (e: any) {
      setActionMsg({ text: e.message ?? "فشل الإجراء", ok: false });
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-5 text-right" dir="rtl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">إدارة الطلبات</h1>
        <p className="text-sm text-slate-400 mt-0.5">اضغط على أي طلب لعرض التفاصيل الكاملة والإجراءات</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "إجمالي الطلبات", val: stats.total, filter: "ALL", color: "text-slate-700" },
          { label: "قيد المراجعة", val: stats.pending, filter: "PENDING", color: "text-amber-600" },
          { label: "طلبات نشطة", val: stats.active, filter: "ACTIVE", color: "text-blue-600" },
          { label: "مُسلَّمة", val: stats.delivered, filter: "DELIVERED", color: "text-emerald-600" },
        ].map((s) => (
          <button
            key={s.label}
            onClick={() => setStatusFilter(s.filter)}
            className={`bg-white rounded-xl border p-4 text-right transition-all hover:shadow-md ${statusFilter === s.filter ? "border-primary ring-1 ring-primary/20 shadow" : "border-slate-200"}`}
          >
            <p className={`text-2xl font-black ${s.color}`}>{loading ? "—" : s.val}</p>
            <p className="text-xs text-slate-400 font-medium mt-1">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالعنوان أو العميل أو الرقم..."
            className="w-full pr-9 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none text-slate-700"
        >
          <option value="ALL">كل الحالات</option>
          <option value="PENDING">قيد المراجعة</option>
          <option value="ACTIVE">نشط</option>
          <option value="ASSIGNED">مُكلَّف</option>
          <option value="IN_TRANSIT">جاري التوصيل</option>
          <option value="DELIVERED">مُسلَّم</option>
          <option value="REJECTED">مرفوض</option>
        </select>
      </div>

      {/* Table + Detail */}
      <div className="flex gap-4 items-start">
        {/* Table */}
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 min-w-0 ${selected ? "hidden lg:block" : ""}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400">الطلب</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400 hidden sm:table-cell">العميل</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400">الحالة</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400 hidden md:table-cell">الميزانية</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400 hidden lg:table-cell">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>{[0,1,2,3,4].map((j) => <td key={j} className="py-4 px-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>)}</tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center text-slate-400">لا توجد طلبات</td></tr>
                ) : filtered.map((r: any) => (
                  <tr
                    key={r.id}
                    onClick={() => { setSelected(r); setActionMsg(null); }}
                    className={`hover:bg-primary/5 cursor-pointer transition-colors ${selected?.id === r.id ? "bg-primary/5 border-r-[3px] border-primary" : ""}`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
                          <FiPackage size={15} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-none line-clamp-1">{r.title}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">#{r.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell text-sm text-slate-600">{r.client?.fullName ?? "—"}</td>
                    <td className="py-3 px-4"><StatusPill status={r.status} /></td>
                    <td className="py-3 px-4 hidden md:table-cell font-bold text-slate-900 text-xs">
                      {r.budget ? formatCurrency(Number(r.budget)) : "—"}
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell text-xs text-slate-400">
                      {r.createdAt ? formatDate(r.createdAt) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && (
            <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
              {filtered.length} طلب
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-full lg:w-[400px] shrink-0 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col" style={{ maxHeight: "calc(100vh - 200px)" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-800 text-sm">تفاصيل الطلب</h3>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/requests/${selected.id}`}
                  className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                >
                  عرض كامل <FiArrowLeft size={12} />
                </Link>
                <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400">
                  <FiX size={16} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-4 space-y-4">
              {/* Title + Status */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-bold text-slate-900 leading-snug">{selected.title}</h4>
                  <StatusPill status={selected.status} />
                </div>
                {selected.description && (
                  <p className="text-xs text-slate-500 leading-relaxed">{selected.description}</p>
                )}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-2">
                {selected.budget && (
                  <div className="p-3 bg-primary/5 border border-primary/15 rounded-xl">
                    <p className="text-xs text-primary/70 flex items-center gap-1 mb-1"><FiDollarSign size={11} />الميزانية</p>
                    <p className="font-black text-primary">{formatCurrency(Number(selected.budget))}</p>
                  </div>
                )}
                {selected.category && (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <p className="text-xs text-slate-400 flex items-center gap-1 mb-1"><FiTag size={11} />الفئة</p>
                    <p className="font-bold text-slate-800 text-sm">{selected.category?.name ?? "—"}</p>
                  </div>
                )}
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="text-xs text-slate-400 flex items-center gap-1 mb-1"><FiUser size={11} />العميل</p>
                  <p className="font-bold text-slate-800 text-sm">{selected.client?.fullName ?? "—"}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <p className="text-xs text-slate-400 flex items-center gap-1 mb-1"><FiCalendar size={11} />التاريخ</p>
                  <p className="font-bold text-slate-800 text-xs">{selected.createdAt ? formatDate(selected.createdAt) : "—"}</p>
                </div>
                {selected.address && (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl col-span-2">
                    <p className="text-xs text-slate-400 flex items-center gap-1 mb-1"><FiMapPin size={11} />العنوان</p>
                    <p className="font-bold text-slate-800 text-xs">{selected.address}</p>
                  </div>
                )}
              </div>

              {/* Action Feedback */}
              {actionMsg && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${actionMsg.ok ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
                  {actionMsg.ok ? <FiCheckCircle size={13} /> : <FiAlertCircle size={13} />}
                  {actionMsg.text}
                </div>
              )}

              {/* Actions */}
              {selected.status === "PENDING" && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">الإجراءات</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => doAction(selected.id, "approve")}
                      disabled={!!actionLoading}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500 text-white border border-emerald-500 hover:bg-emerald-600 rounded-xl font-semibold text-sm transition-all disabled:opacity-60"
                    >
                      {actionLoading === "approve" ? <FiLoader size={14} className="animate-spin" /> : <FiCheckCircle size={15} />}
                      قبول الطلب
                    </button>
                    <button
                      onClick={() => doAction(selected.id, "reject")}
                      disabled={!!actionLoading}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 rounded-xl font-semibold text-sm transition-all disabled:opacity-60"
                    >
                      {actionLoading === "reject" ? <FiLoader size={14} className="animate-spin" /> : <FiXCircle size={15} />}
                      رفض الطلب
                    </button>
                  </div>
                </div>
              )}
              {selected.status === "ASSIGNED" && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">الإجراءات</p>
                  <button
                    onClick={() => doAction(selected.id, "dispatch")}
                    disabled={!!actionLoading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-500 text-white border border-indigo-500 hover:bg-indigo-600 rounded-xl font-semibold text-sm transition-all disabled:opacity-60"
                  >
                    {actionLoading === "dispatch" ? <FiLoader size={14} className="animate-spin" /> : <FiTruck size={15} />}
                    إرسال للتوصيل
                  </button>
                </div>
              )}

              {/* Full View Link */}
              <Link
                href={`/admin/requests/${selected.id}`}
                className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl font-semibold text-sm transition-all"
              >
                <FiChevronLeft size={15} />
                عرض كل التفاصيل والعروض
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
