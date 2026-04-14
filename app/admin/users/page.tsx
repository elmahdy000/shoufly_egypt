"use client";

import { useState, useMemo } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatCurrency } from "@/lib/formatters";
import {
  FiSearch, FiX, FiPhone, FiCalendar,
  FiDollarSign, FiTruck, FiStar, FiSlash, FiCheckCircle,
  FiAlertCircle, FiLoader, FiBriefcase, FiUser
} from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

type Role = "ALL" | "CLIENT" | "VENDOR" | "DELIVERY" | "ADMIN";

const ROLE_META: Record<string, { label: string; color: string; bg: string }> = {
  ADMIN:    { label: "أدمن",   color: "text-violet-700", bg: "bg-violet-50 border-violet-200" },
  CLIENT:   { label: "عميل",   color: "text-blue-700",   bg: "bg-blue-50 border-blue-200" },
  VENDOR:   { label: "تاجر",   color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  DELIVERY: { label: "مندوب",  color: "text-emerald-700",bg: "bg-emerald-50 border-emerald-200" },
};

function RolePill({ role }: { role: string }) {
  const m = ROLE_META[role] ?? { label: role, color: "text-slate-600", bg: "bg-slate-100 border-slate-200" };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-bold border ${m.bg} ${m.color}`}>{m.label}</span>;
}

function ActionBtn({ icon, label, color, loading, onClick }: {
  icon: React.ReactNode; label: string; color: string; loading: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border font-semibold text-sm transition-all disabled:opacity-60 ${color}`}
    >
      {loading ? <FiLoader size={14} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}

export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState<Role>("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const { data: users, loading, error, setData } = useAsyncData<any[]>(
    () => apiFetch("/api/admin/users", "ADMIN"), []
  );

  const filtered = useMemo(() => {
    let list = users ?? [];
    if (roleFilter !== "ALL") list = list.filter((u: any) => u.role === roleFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((u: any) =>
        u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || String(u.id) === q
      );
    }
    return list;
  }, [users, roleFilter, search]);

  const stats = useMemo(() => {
    const all = users ?? [];
    return {
      total: all.length,
      vendors: all.filter((u: any) => u.role === "VENDOR").length,
      clients: all.filter((u: any) => u.role === "CLIENT").length,
      delivery: all.filter((u: any) => u.role === "DELIVERY").length,
    };
  }, [users]);

  async function doAction(userId: number, action: string) {
    setActionLoading(action);
    setActionMsg(null);
    try {
      await apiFetch<any>(`/api/admin/users/${userId}/moderation`, "ADMIN", {
        method: "PATCH", body: { action },
      });
      const patch: any = {};
      if (action === "BLOCK") patch.isActive = false;
      if (action === "UNBLOCK") patch.isActive = true;
      setData((prev: any[]) => (prev ?? []).map((u) => u.id === userId ? { ...u, ...patch } : u));
      setSelected((prev: any) => prev?.id === userId ? { ...prev, ...patch } : prev);
      setActionMsg({ text: "تم تنفيذ الإجراء بنجاح ✓", ok: true });
    } catch (e: any) {
      setActionMsg({ text: e.message ?? "فشل تنفيذ الإجراء", ok: false });
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-5 text-right" dir="rtl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">إدارة المستخدمين</h1>
        <p className="text-sm text-slate-400 mt-0.5">اضغط على أي مستخدم لعرض التفاصيل والإجراءات</p>
      </div>

      {/* Role Tabs */}
      <div className="flex flex-wrap gap-2">
        {([
          { label: "الكل", val: stats.total, filter: "ALL" as Role },
          { label: "عملاء", val: stats.clients, filter: "CLIENT" as Role },
          { label: "تجار", val: stats.vendors, filter: "VENDOR" as Role },
          { label: "مندوبون", val: stats.delivery, filter: "DELIVERY" as Role },
        ]).map((s) => (
          <button
            key={s.label}
            onClick={() => setRoleFilter(s.filter)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
              roleFilter === s.filter
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            }`}
          >
            {s.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${roleFilter === s.filter ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
              {loading ? "…" : s.val}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث بالاسم أو البريد الإلكتروني..."
          className="w-full pr-9 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-primary transition-all"
        />
      </div>

      {/* Table + Detail */}
      <div className="flex gap-4 items-start">
        {/* Table */}
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 min-w-0 ${selected ? "hidden lg:block" : ""}`}>
          {error && <div className="p-4 m-4 bg-rose-50 text-rose-600 rounded-xl text-sm border border-rose-200">خطأ في تحميل البيانات</div>}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400">المستخدم</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400">الدور</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400 hidden sm:table-cell">المحفظة</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400 hidden md:table-cell">الحالة</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-400 hidden lg:table-cell">التسجيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {[0,1,2,3,4].map((j) => (
                        <td key={j} className="py-4 px-4">
                          <div className="h-4 bg-slate-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center text-slate-400">لا يوجد مستخدمون</td></tr>
                ) : filtered.map((u: any) => (
                  <tr
                    key={u.id}
                    onClick={() => { setSelected(u); setActionMsg(null); }}
                    className={`hover:bg-primary/5 cursor-pointer transition-colors ${selected?.id === u.id ? "bg-primary/5 border-r-[3px] border-primary" : ""}`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-700 font-bold shrink-0">
                          {u.fullName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-none">{u.fullName}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4"><RolePill role={u.role} /></td>
                    <td className="py-3 px-4 hidden sm:table-cell font-bold text-slate-900 text-xs">
                      {formatCurrency(Number(u.walletBalance))}
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${u.isActive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
                        {u.isActive ? "نشط" : "محظور"}
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell text-xs text-slate-400">
                      {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true, locale: ar })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && (
            <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
              {filtered.length} من أصل {users?.length ?? 0} مستخدم
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="w-full lg:w-[380px] shrink-0 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col" style={{ maxHeight: "calc(100vh - 200px)" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-800 text-sm">تفاصيل المستخدم</h3>
              <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors">
                <FiX size={16} />
              </button>
            </div>

            <div className="overflow-y-auto p-4 space-y-4">
              {/* Avatar Hero */}
              <div className="p-4 bg-gradient-to-l from-slate-50 to-orange-50/40 rounded-xl border border-slate-100 flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-black text-xl shadow-md shrink-0">
                  {selected.fullName?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 truncate">{selected.fullName}</h4>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{selected.email}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <RolePill role={selected.role} />
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${selected.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-600 border-rose-200"}`}>
                      {selected.isActive ? "✓ نشط" : "✗ محظور"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-primary/5 border border-primary/15 rounded-xl col-span-2">
                  <p className="text-xs text-primary/70 flex items-center gap-1 mb-1"><FiDollarSign size={11} />رصيد المحفظة</p>
                  <p className="font-black text-primary text-lg">{formatCurrency(Number(selected.walletBalance))}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-400 flex items-center gap-1 mb-1"><FiCalendar size={11} />تاريخ التسجيل</p>
                  <p className="font-bold text-slate-800 text-xs">{new Date(selected.createdAt).toLocaleDateString("ar-EG")}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-400 mb-1">رقم المستخدم</p>
                  <p className="font-mono font-black text-slate-900">#{selected.id}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
                  <p className="text-xs text-slate-400 flex items-center gap-1 mb-1"><FiPhone size={11} />رقم الهاتف</p>
                  <p className="font-bold text-slate-800 text-sm" dir="ltr">{selected.phone ?? "—"}</p>
                </div>
              </div>

              {/* Feedback */}
              {actionMsg && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${actionMsg.ok ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
                  {actionMsg.ok ? <FiCheckCircle size={13} /> : <FiAlertCircle size={13} />}
                  {actionMsg.text}
                </div>
              )}

              {/* Actions */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">إجراءات الإشراف</p>
                <div className="space-y-2">
                  {selected.role === "VENDOR" && (
                    <ActionBtn
                      icon={<FiStar size={15} />}
                      label={selected.isVerified ? "إلغاء توثيق الحساب" : "توثيق حساب التاجر"}
                      color={selected.isVerified
                        ? "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        : "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600"
                      }
                      loading={actionLoading === (selected.isVerified ? "UNVERIFY" : "VERIFY")}
                      onClick={() => doAction(selected.id, selected.isVerified ? "UNVERIFY" : "VERIFY")}
                    />
                  )}
                  {selected.isActive ? (
                    <ActionBtn
                      icon={<FiSlash size={15} />}
                      label="حظر الحساب"
                      color="bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
                      loading={actionLoading === "BLOCK"}
                      onClick={() => doAction(selected.id, "BLOCK")}
                    />
                  ) : (
                    <ActionBtn
                      icon={<FiCheckCircle size={15} />}
                      label="رفع الحظر وإعادة التفعيل"
                      color="bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                      loading={actionLoading === "UNBLOCK"}
                      onClick={() => doAction(selected.id, "UNBLOCK")}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
