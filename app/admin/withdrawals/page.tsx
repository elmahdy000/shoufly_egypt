"use client";

import { useState, useMemo } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { reviewAdminWithdrawal } from "@/lib/api/transactions";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  FiSearch, FiX, FiUser, FiCalendar, FiHash, FiLoader,
  FiCheckCircle, FiXCircle, FiAlertCircle,
  FiMessageSquare
} from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  PENDING:  { label: "معلق",    color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200" },
  APPROVED: { label: "مُعتمَد",  color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  REJECTED: { label: "مرفوض",   color: "text-rose-700",    bg: "bg-rose-50",    border: "border-rose-200" },
};

function StatusPill({ status }: { status: string }) {
  const m = STATUS_META[status] ?? { label: status, color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200" };
  return <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${m.bg} ${m.border} ${m.color}`}>{m.label}</span>;
}

export default function AdminWithdrawalsPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const { data: withdrawals, loading, error, setData } = useAsyncData<any[]>(
    () => apiFetch("/api/admin/withdrawals", "ADMIN"), []
  );

  const filtered = useMemo(() => {
    let list = withdrawals ?? [];
    if (statusFilter !== "ALL") list = list.filter((w: any) => w.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((w: any) =>
        w.vendor?.fullName?.toLowerCase().includes(q) ||
        w.vendor?.email?.toLowerCase().includes(q) ||
        String(w.id).includes(q)
      );
    }
    return list;
  }, [withdrawals, statusFilter, search]);

  const stats = useMemo(() => {
    const all = withdrawals ?? [];
    return {
      total: all.length,
      pending: all.filter((w: any) => w.status === "PENDING").length,
      approved: all.filter((w: any) => w.status === "APPROVED").length,
      rejected: all.filter((w: any) => w.status === "REJECTED").length,
      totalAmount: all.filter((w: any) => w.status === "APPROVED").reduce((s: number, w: any) => s + Number(w.amount), 0),
      pendingAmount: all.filter((w: any) => w.status === "PENDING").reduce((s: number, w: any) => s + Number(w.amount), 0),
    };
  }, [withdrawals]);

  async function doApprove(id: number) {
    setActionLoading("approve");
    setActionMsg(null);
    try {
      await reviewAdminWithdrawal(id, "APPROVE");
      setData((prev: any[]) => (prev ?? []).map((w) => w.id === id ? { ...w, status: "APPROVED" } : w));
      setSelected((prev: any) => prev?.id === id ? { ...prev, status: "APPROVED" } : prev);
      setActionMsg({ text: "تم الاعتماد بنجاح ✓", ok: true });
    } catch (e: any) {
      setActionMsg({ text: e.message ?? "فشل الاعتماد", ok: false });
    } finally {
      setActionLoading(null);
    }
  }

  async function doReject(id: number) {
    setActionLoading("reject");
    setActionMsg(null);
    try {
      await reviewAdminWithdrawal(id, "REJECT", rejectNote || "رفض من قِبَل الإدارة");
      setData((prev: any[]) => (prev ?? []).map((w) => w.id === id ? { ...w, status: "REJECTED", reviewNote: rejectNote } : w));
      setSelected((prev: any) => prev?.id === id ? { ...prev, status: "REJECTED", reviewNote: rejectNote } : prev);
      setActionMsg({ text: "تم الرفض ✓", ok: true });
      setRejectNote("");
    } catch (e: any) {
      setActionMsg({ text: e.message ?? "فشل الرفض", ok: false });
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-5 text-right" dir="rtl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">طلبات السحب</h1>
        <p className="text-sm text-slate-400 mt-0.5">مراجعة واعتماد طلبات سحب أرباح التجار</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "معلق", val: stats.pending, sub: formatCurrency(stats.pendingAmount), filter: "PENDING", color: "text-amber-700" },
          { label: "مُعتمَد", val: stats.approved, sub: formatCurrency(stats.totalAmount), filter: "APPROVED", color: "text-emerald-700" },
          { label: "مرفوض", val: stats.rejected, filter: "REJECTED", color: "text-rose-700" },
          { label: "الكل", val: stats.total, filter: "ALL", color: "text-slate-700" },
        ].map((s) => (
          <button
            key={s.label}
            onClick={() => setStatusFilter(s.filter)}
            className={`bg-white rounded-xl border p-4 text-right transition-all hover:shadow-md ${statusFilter === s.filter ? "border-primary ring-1 ring-primary/20 shadow" : "border-slate-200"}`}
          >
            <p className={`text-2xl font-black ${s.color}`}>{loading ? "—" : s.val}</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{s.label}</p>
            {s.sub && <p className="text-xs text-slate-300">{s.sub}</p>}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث بالتاجر أو البريد..."
          className="w-full pr-9 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-primary"
        />
      </div>

      {/* Table + Detail */}
      <div className="flex gap-4 items-start">
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 min-w-0 ${selected ? "hidden lg:block" : ""}`}>
          {error && <div className="p-4 m-4 bg-rose-50 text-rose-600 rounded-xl text-sm border border-rose-200">خطأ في التحميل</div>}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400">التاجر</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400">المبلغ</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400">الحالة</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400 hidden md:table-cell">التاريخ</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400 hidden lg:table-cell">مراجعة بواسطة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>{[0,1,2,3,4].map((j) => <td key={j} className="py-4 px-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>)}</tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center text-slate-400">لا توجد طلبات سحب</td></tr>
                ) : filtered.map((w: any) => (
                  <tr
                    key={w.id}
                    onClick={() => { setSelected(w); setActionMsg(null); setRejectNote(""); }}
                    className={`hover:bg-primary/5 cursor-pointer transition-colors ${selected?.id === w.id ? "bg-primary/5 border-r-[3px] border-primary" : ""} ${w.status === "PENDING" ? "border-r-[3px] border-amber-400" : ""}`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-xs shrink-0">
                          {w.vendor?.fullName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-none">{w.vendor?.fullName}</p>
                          <p className="text-[11px] text-slate-400">{w.vendor?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900">{formatCurrency(Number(w.amount))}</td>
                    <td className="py-3 px-4"><StatusPill status={w.status} /></td>
                    <td className="py-3 px-4 hidden md:table-cell text-xs text-slate-400">
                      {formatDistanceToNow(new Date(w.createdAt), { addSuffix: true, locale: ar })}
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell text-xs text-slate-500">
                      {w.reviewedBy?.fullName ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && (
            <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
              {filtered.length} طلب سحب
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-full lg:w-[380px] shrink-0 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col" style={{ maxHeight: "calc(100vh - 200px)" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-800 text-sm">تفاصيل طلب السحب</h3>
              <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400">
                <FiX size={16} />
              </button>
            </div>

            <div className="overflow-y-auto p-4 space-y-4">
              {/* Amount Hero */}
              <div className={`p-5 rounded-xl text-center border ${STATUS_META[selected.status]?.bg ?? "bg-slate-50"} ${STATUS_META[selected.status]?.border ?? "border-slate-200"}`}>
                <p className="text-xs text-slate-500 mb-1">مبلغ السحب</p>
                <p className={`text-4xl font-black ${STATUS_META[selected.status]?.color ?? "text-slate-900"}`}>
                  {formatCurrency(Number(selected.amount))}
                </p>
                <div className="mt-2"><StatusPill status={selected.status} /></div>
              </div>

              {/* Vendor Info */}
              <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100">
                <p className="text-xs text-slate-400 mb-2 font-semibold">معلومات التاجر</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-700 font-black shrink-0">
                    {selected.vendor?.fullName?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{selected.vendor?.fullName}</p>
                    <p className="text-xs text-slate-500">{selected.vendor?.email}</p>
                  </div>
                </div>
              </div>

              {/* Info Rows */}
              <div className="space-y-2">
                <InfoRow icon={<FiHash size={13} />} label="رقم الطلب" value={`#${selected.id}`} mono />
                <InfoRow icon={<FiCalendar size={13} />} label="تاريخ الطلب" value={selected.createdAt ? formatDate(selected.createdAt) : "—"} />
                {selected.reviewedBy && (
                  <InfoRow icon={<FiUser size={13} />} label="راجعه" value={selected.reviewedBy.fullName} />
                )}
                {selected.reviewNote && (
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                    <p className="text-xs text-rose-500 flex items-center gap-1 mb-1"><FiMessageSquare size={11} />ملاحظة المراجعة</p>
                    <p className="text-sm font-medium text-rose-800">{selected.reviewNote}</p>
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

              {/* Actions for PENDING */}
              {selected.status === "PENDING" && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">الإجراءات</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => doApprove(selected.id)}
                      disabled={!!actionLoading}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500 text-white border border-emerald-500 hover:bg-emerald-600 rounded-xl font-semibold text-sm transition-all disabled:opacity-60"
                    >
                      {actionLoading === "approve" ? <FiLoader size={14} className="animate-spin" /> : <FiCheckCircle size={15} />}
                      اعتماد وصرف المبلغ
                    </button>

                    <div className="space-y-1.5">
                      <textarea
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        placeholder="سبب الرفض (اختياري)..."
                        rows={2}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none outline-none focus:border-rose-300 focus:bg-white transition-all"
                      />
                      <button
                        onClick={() => doReject(selected.id)}
                        disabled={!!actionLoading}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 rounded-xl font-semibold text-sm transition-all disabled:opacity-60"
                      >
                        {actionLoading === "reject" ? <FiLoader size={14} className="animate-spin" /> : <FiXCircle size={15} />}
                        رفض الطلب
                      </button>
                    </div>
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

function InfoRow({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
      <span className="text-xs text-slate-400 flex items-center gap-1">{icon}{label}</span>
      <span className={`text-sm font-bold text-slate-800 ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
