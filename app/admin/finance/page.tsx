"use client";

import { useState, useMemo } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  FiDollarSign, FiArrowUpRight, FiArrowDownLeft, FiSearch,
  FiX, FiUser, FiPackage, FiCalendar, FiHash, FiAlertCircle, FiFileText
} from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

const TX_TYPE_META: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  WALLET_TOPUP:     { label: "شحن محفظة",     icon: <FiArrowDownLeft  size={13} />, color: "text-emerald-700", bg: "bg-emerald-50" },
  ESCROW_DEPOSIT:   { label: "إيداع ضمان",     icon: <FiArrowDownLeft  size={13} />, color: "text-blue-700",    bg: "bg-blue-50"    },
  ESCROW_RELEASE:   { label: "إفراج ضمان",     icon: <FiArrowUpRight   size={13} />, color: "text-violet-700", bg: "bg-violet-50"  },
  WITHDRAWAL:       { label: "سحب",            icon: <FiArrowUpRight   size={13} />, color: "text-rose-700",   bg: "bg-rose-50"    },
  REFUND:           { label: "مسترد",          icon: <FiArrowDownLeft  size={13} />, color: "text-orange-700", bg: "bg-orange-50"  },
  PLATFORM_FEE:     { label: "رسوم المنصة",   icon: <FiArrowUpRight   size={13} />, color: "text-slate-700",  bg: "bg-slate-100"  },
};

function TypeBadge({ type }: { type: string }) {
  const m = TX_TYPE_META[type] ?? { label: type, icon: null, color: "text-slate-600", bg: "bg-slate-100" };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold ${m.bg} ${m.color}`}>
      {m.icon}{m.label}
    </span>
  );
}

const ROLE_LABELS: Record<string, string> = {
  CLIENT: "عميل", VENDOR: "تاجر", DELIVERY: "مندوب", ADMIN: "أدمن"
};

export default function AdminFinancePage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [selected, setSelected] = useState<any>(null);

  const { data: transactions, loading, error } = useAsyncData<any[]>(
    () => apiFetch("/api/admin/finance/transactions", "ADMIN"), []
  );

  const filtered = useMemo(() => {
    let list = transactions ?? [];
    if (typeFilter !== "ALL") list = list.filter((t: any) => t.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t: any) =>
        t.user?.fullName?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        String(t.id).includes(q)
      );
    }
    return list;
  }, [transactions, typeFilter, search]);

  const stats = useMemo(() => {
    const all = transactions ?? [];
    const total = all.reduce((s: number, t: any) => s + Number(t.amount), 0);
    const topups = all.filter((t: any) => t.type === "WALLET_TOPUP").reduce((s: number, t: any) => s + Number(t.amount), 0);
    const withdrawals = all.filter((t: any) => t.type === "WITHDRAWAL").reduce((s: number, t: any) => s + Number(t.amount), 0);
    const fees = all.filter((t: any) => t.type === "PLATFORM_FEE").reduce((s: number, t: any) => s + Number(t.amount), 0);
    return { total, topups, withdrawals, fees, count: all.length };
  }, [transactions]);

  return (
    <div className="space-y-5 text-right" dir="rtl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">السجل المالي</h1>
        <p className="text-sm text-slate-400 mt-0.5">جميع المعاملات المالية على المنصة — اضغط للتفاصيل</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "إجمالي الحركات", val: formatCurrency(stats.total), sub: `${stats.count} معاملة`, color: "text-slate-900" },
          { label: "شحن المحافظ", val: formatCurrency(stats.topups), color: "text-emerald-700" },
          { label: "المسحوبات", val: formatCurrency(stats.withdrawals), color: "text-rose-700" },
          { label: "رسوم المنصة", val: formatCurrency(stats.fees), color: "text-violet-700" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className={`text-lg font-black ${s.color}`}>{loading ? "—" : s.val}</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{s.label}</p>
            {s.sub && <p className="text-xs text-slate-300 mt-0.5">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالمستخدم أو الوصف..."
            className="w-full pr-9 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-primary"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none text-slate-700"
        >
          <option value="ALL">كل الأنواع</option>
          {Object.entries(TX_TYPE_META).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Table + Detail */}
      <div className="flex gap-4 items-start">
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 min-w-0 ${selected ? "hidden lg:block" : ""}`}>
          {error && <div className="p-4 m-4 bg-rose-50 text-rose-600 rounded-xl text-sm border border-rose-200">خطأ في التحميل</div>}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400">المستخدم</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400">النوع</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400">المبلغ</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400 hidden md:table-cell">الوصف</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400 hidden lg:table-cell">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>{[0,1,2,3,4].map((j) => <td key={j} className="py-4 px-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>)}</tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center text-slate-400">لا توجد معاملات</td></tr>
                ) : filtered.map((t: any) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelected(t)}
                    className={`hover:bg-primary/5 cursor-pointer transition-colors ${selected?.id === t.id ? "bg-primary/5 border-r-[3px] border-primary" : ""}`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                          {t.user?.fullName?.charAt(0) ?? "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm leading-none">{t.user?.fullName ?? "—"}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{ROLE_LABELS[t.user?.role] ?? t.user?.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4"><TypeBadge type={t.type} /></td>
                    <td className="py-3 px-4 font-black text-slate-900">{formatCurrency(Number(t.amount))}</td>
                    <td className="py-3 px-4 hidden md:table-cell text-xs text-slate-500 max-w-[180px] truncate">{t.description}</td>
                    <td className="py-3 px-4 hidden lg:table-cell text-xs text-slate-400">
                      {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true, locale: ar })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && (
            <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
              {filtered.length} معاملة
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-full lg:w-[360px] shrink-0 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col" style={{ maxHeight: "calc(100vh - 200px)" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-800 text-sm">تفاصيل المعاملة</h3>
              <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400">
                <FiX size={16} />
              </button>
            </div>

            <div className="overflow-y-auto p-4 space-y-4">
              {/* Amount Hero */}
              <div className={`p-5 rounded-xl border text-center ${TX_TYPE_META[selected.type]?.bg ?? "bg-slate-50"} border-slate-100`}>
                <div className={`text-4xl font-black mb-1 ${TX_TYPE_META[selected.type]?.color ?? "text-slate-800"}`}>
                  {formatCurrency(Number(selected.amount))}
                </div>
                <TypeBadge type={selected.type} />
              </div>

              {/* Info */}
              <div className="space-y-2">
                <InfoRow icon={<FiHash size={13} />} label="رقم المعاملة" value={`#${selected.id}`} mono />
                <InfoRow icon={<FiUser size={13} />} label="المستخدم" value={selected.user?.fullName ?? "—"} />
                <InfoRow icon={<FiUser size={13} />} label="الدور" value={ROLE_LABELS[selected.user?.role] ?? selected.user?.role ?? "—"} />
                <InfoRow icon={<FiCalendar size={13} />} label="التاريخ" value={selected.createdAt ? formatDate(selected.createdAt) : "—"} />
                {selected.requestId && (
                  <InfoRow icon={<FiPackage size={13} />} label="رقم الطلب" value={`#${selected.requestId}`} mono />
                )}
                {selected.description && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-400 flex items-center gap-1 mb-1"><FiFileText size={11} />الوصف</p>
                    <p className="text-sm text-slate-700 font-medium">{selected.description}</p>
                  </div>
                )}
              </div>
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
