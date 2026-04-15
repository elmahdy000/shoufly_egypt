"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  Activity,
  Briefcase,
  CheckSquare,
  Filter,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Square,
  Truck,
  User,
  UserCog,
  Users,
  Wallet,
  X,
} from "lucide-react";

type RoleFilter = "ALL" | "CLIENT" | "VENDOR" | "DELIVERY" | "ADMIN";
type SmartFilter = "ALL" | "ACTIVE" | "BLOCKED" | "NEW" | "UNVERIFIED" | "HIGH_RISK" | "NO_ACTIVITY";
type ModerationAction = "VERIFY" | "UNVERIFY" | "BLOCK" | "UNBLOCK";
type RiskLevel = "منخفض" | "متوسط" | "مرتفع";

interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  role: "CLIENT" | "VENDOR" | "DELIVERY" | "ADMIN" | string;
  isActive: boolean;
  isVerified: boolean;
  isBlocked: boolean;
  walletBalance: number | string;
  createdAt: string;
  updatedAt: string;
  _count: {
    clientRequests: number;
    vendorBids: number;
    assignedDeliveries: number;
    transactions: number;
    complaints: number;
  };
}

type Row = AdminUser & {
  blocked: boolean;
  activityCount: number;
  riskScore: number;
  riskLevel: RiskLevel;
  riskReasons: string[];
  isNew: boolean;
  activeToday: boolean;
  nextAction: string;
};

const roleLabel = (role: AdminUser["role"]) =>
  role === "CLIENT" ? "عميل" : role === "VENDOR" ? "تاجر" : role === "DELIVERY" ? "مندوب" : role === "ADMIN" ? "إدارة" : role;

const roleIcon = (role: AdminUser["role"]) =>
  role === "VENDOR" ? Briefcase : role === "DELIVERY" ? Truck : role === "ADMIN" ? UserCog : User;

const activityCount = (u: AdminUser) =>
  u.role === "CLIENT" ? u._count.clientRequests : u.role === "VENDOR" ? u._count.vendorBids : u.role === "DELIVERY" ? u._count.assignedDeliveries : u._count.transactions;

const withinDays = (iso: string, days: number) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return Date.now() - d.getTime() <= days * 24 * 60 * 60 * 1000;
};

function risk(u: AdminUser): { score: number; level: RiskLevel; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;
  const blocked = u.isBlocked || !u.isActive;
  const acts = activityCount(u);
  const complaints = u._count.complaints;
  const wallet = Number(u.walletBalance) || 0;

  if (blocked) {
    score += 55;
    reasons.push("الحساب موقوف");
  }
  if (!u.isVerified) {
    score += 20;
    reasons.push("غير موثق");
  }
  if (acts === 0 && !withinDays(u.createdAt, 14)) {
    score += 15;
    reasons.push("بدون نشاط");
  }
  if (complaints > 0) {
    score += Math.min(20, complaints * 5);
    reasons.push(`شكاوى: ${complaints}`);
  }
  if (wallet >= 20000 && !u.isVerified) {
    score += 10;
    reasons.push("رصيد مرتفع بدون توثيق");
  }

  const bounded = Math.min(100, score);
  const level: RiskLevel = bounded >= 70 ? "مرتفع" : bounded >= 35 ? "متوسط" : "منخفض";
  return { score: bounded, level, reasons };
}

const patchByAction = (u: AdminUser, action: ModerationAction): AdminUser =>
  action === "BLOCK"
    ? { ...u, isBlocked: true, isActive: false }
    : action === "UNBLOCK"
    ? { ...u, isBlocked: false, isActive: true }
    : action === "VERIFY"
    ? { ...u, isVerified: true }
    : { ...u, isVerified: false };

export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [smartFilter, setSmartFilter] = useState<SmartFilter>("ALL");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(null);
  const [lastSync, setLastSync] = useState(new Date());

  const { data, loading, refresh, setData } = useAsyncData<AdminUser[]>(
    () => apiFetch<AdminUser[]>("/api/admin/users?limit=300", "ADMIN"),
    []
  );

  const rows = useMemo<Row[]>(() => {
    return (data ?? []).map((u) => {
      const blocked = u.isBlocked || !u.isActive;
      const acts = activityCount(u);
      const r = risk(u);
      const nextAction = blocked ? "مراجعة سبب الإيقاف" : !u.isVerified ? "طلب توثيق الحساب" : r.score >= 70 ? "فتح مراجعة أمنية" : acts === 0 ? "تنبيه تفعيل الاستخدام" : "متابعة دورية";
      return { ...u, blocked, activityCount: acts, riskScore: r.score, riskLevel: r.level, riskReasons: r.reasons, isNew: withinDays(u.createdAt, 14), activeToday: withinDays(u.updatedAt, 1), nextAction };
    });
  }, [data]);

  const filtered = useMemo(() => {
    let list = rows;
    if (roleFilter !== "ALL") list = list.filter((u) => u.role === roleFilter);
    if (smartFilter === "ACTIVE") list = list.filter((u) => !u.blocked);
    if (smartFilter === "BLOCKED") list = list.filter((u) => u.blocked);
    if (smartFilter === "NEW") list = list.filter((u) => u.isNew);
    if (smartFilter === "UNVERIFIED") list = list.filter((u) => !u.isVerified);
    if (smartFilter === "HIGH_RISK") list = list.filter((u) => u.riskScore >= 70);
    if (smartFilter === "NO_ACTIVITY") list = list.filter((u) => u.activityCount === 0);

    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.phone ?? "").includes(q) || String(u.id).includes(q));
  }, [rows, roleFilter, smartFilter, search]);

  const selected = useMemo(() => rows.find((u) => u.id === selectedId) ?? null, [rows, selectedId]);

  const stats = useMemo(() => {
    const total = rows.length;
    const activeToday = rows.filter((u) => u.activeToday).length;
    const highRisk = rows.filter((u) => u.riskScore >= 70).length;
    const unverified = rows.filter((u) => !u.isVerified).length;
    const noActivity = rows.filter((u) => u.activityCount === 0).length;
    return { total, activeToday, highRisk, noActivity, verifyRate: total ? Math.round(((total - unverified) / total) * 100) : 0 };
  }, [rows]);

  const allVisibleSelected = filtered.length > 0 && filtered.every((u) => selectedIds.includes(u.id));

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    await refresh();
    setLastSync(new Date());
    setTimeout(() => setIsRefreshing(false), 400);
  }, [refresh]);

  const runAction = useCallback(async (ids: number[], action: ModerationAction) => {
    if (!ids.length) return;
    const key = `${action}:${ids.length}`;
    setBusyKey(key);
    setNotice(null);

    const results = await Promise.allSettled(
      ids.map((id) => apiFetch(`/api/admin/users/${id}/moderation`, "ADMIN", { method: "PATCH", body: { action } }))
    );
    const successIds = ids.filter((_, i) => results[i].status === "fulfilled");
    const failed = ids.length - successIds.length;

    if (successIds.length) {
      setData((prev) => (prev ?? []).map((u) => (successIds.includes(u.id) ? patchByAction(u, action) : u)));
    }
    setNotice({ text: failed ? `تم تنفيذ ${successIds.length} وفشل ${failed}` : `تم تنفيذ الإجراء على ${successIds.length} مستخدم`, ok: failed === 0 });
    setBusyKey(null);
  }, [setData]);

  return (
    <div className="admin-page admin-page--spacious" dir="rtl">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-black text-primary">User Intelligence Console</span>
            <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">إدارة <span className="text-primary">المستخدمين</span> باحترافية</h1>
            <p className="text-sm text-slate-600">بحث ذكي، تقييم مخاطر، إجراءات فردية وجماعية، ولوحة تفاصيل عملية.</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <label className="relative block w-full sm:w-96">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث بالاسم، البريد، الهاتف أو ID..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pr-11 pl-4 text-sm outline-none focus:border-primary focus:bg-white" />
            </label>
            <button onClick={refreshData} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 hover:border-primary hover:text-primary"><RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />تحديث</button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Kpi label="إجمالي المستخدمين" value={stats.total} icon={Users} />
        <Kpi label="نشط اليوم" value={stats.activeToday} icon={Activity} highlight />
        <Kpi label="معدل التوثيق" value={`${stats.verifyRate}%`} icon={ShieldCheck} />
        <Kpi label="مخاطر عالية" value={stats.highRisk} icon={ShieldAlert} danger />
        <Kpi label="بدون نشاط" value={stats.noActivity} icon={User} />
      </section>

      <section className="glass-card p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          {([{ id: "ALL", label: "كل المستخدمين" }, { id: "CLIENT", label: "العملاء" }, { id: "VENDOR", label: "التجار" }, { id: "DELIVERY", label: "المندوبون" }, { id: "ADMIN", label: "الإدارة" }] as { id: RoleFilter; label: string }[]).map((tab) => (
            <button key={tab.id} onClick={() => setRoleFilter(tab.id)} className={`rounded-xl px-3 py-2 text-xs font-black ${roleFilter === tab.id ? "bg-primary text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>{tab.label}</button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-black text-slate-500"><Filter size={12} />فلاتر ذكية</span>
          {([{ id: "ALL", label: "الكل" }, { id: "ACTIVE", label: "نشط" }, { id: "BLOCKED", label: "موقوف" }, { id: "NEW", label: "جديد" }, { id: "UNVERIFIED", label: "غير موثق" }, { id: "HIGH_RISK", label: "مخاطر عالية" }, { id: "NO_ACTIVITY", label: "بدون نشاط" }] as { id: SmartFilter; label: string }[]).map((tab) => (
            <button key={tab.id} onClick={() => setSmartFilter(tab.id)} className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${smartFilter === tab.id ? "border-primary/30 bg-orange-50 text-primary" : "border-slate-200 bg-white text-slate-500 hover:text-slate-700"}`}>{tab.label}</button>
          ))}
          <span className="mr-auto text-xs font-bold text-slate-400">آخر مزامنة: {lastSync.toLocaleTimeString("ar-EG")}</span>
        </div>
      </section>

      {selectedIds.length > 0 && (
        <section className="rounded-2xl border border-primary/20 bg-primary/5 p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-black text-slate-700">تم تحديد {selectedIds.length} مستخدم</span>
            <button onClick={() => runAction(selectedIds, "VERIFY")} disabled={busyKey === `VERIFY:${selectedIds.length}`} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:border-primary hover:text-primary">توثيق المحدد</button>
            <button onClick={() => runAction(selectedIds, "UNBLOCK")} disabled={busyKey === `UNBLOCK:${selectedIds.length}`} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:border-primary hover:text-primary">إعادة التفعيل</button>
            <button onClick={() => runAction(selectedIds, "BLOCK")} disabled={busyKey === `BLOCK:${selectedIds.length}`} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 hover:bg-rose-100">إيقاف المحدد</button>
            <button onClick={() => setSelectedIds([])} className="mr-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50">إلغاء التحديد</button>
          </div>
        </section>
      )}

      {notice && <div className={`rounded-xl border px-4 py-3 text-sm font-bold ${notice.ok ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{notice.text}</div>}

      <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
        <section className="flex-1 glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table min-w-[980px]">
              <thead>
                <tr>
                  <th className="w-12"><button onClick={() => setSelectedIds((prev) => allVisibleSelected ? prev.filter((id) => !filtered.some((u) => u.id === id)) : Array.from(new Set([...prev, ...filtered.map((u) => u.id)])))} className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:border-primary hover:text-primary">{allVisibleSelected ? <CheckSquare size={14} /> : <Square size={14} />}</button></th>
                  <th>المستخدم</th><th>الدور</th><th>الحالة</th><th>النشاط</th><th>المحفظة</th><th>المخاطر</th><th>آخر تحديث</th><th className="text-left">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {loading ? Array.from({ length: 6 }).map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={9} className="h-16 bg-slate-50/60" /></tr>) : filtered.length === 0 ? <tr><td colSpan={9} className="py-20 text-center text-sm font-black text-slate-400">لا توجد نتائج مطابقة للفلاتر الحالية.</td></tr> : filtered.map((u) => {
                  const RoleIcon = roleIcon(u.role);
                  return (
                    <tr key={u.id} onClick={() => setSelectedId(u.id)} className={selectedId === u.id ? "bg-orange-50/60" : ""}>
                      <td><button onClick={(e) => { e.stopPropagation(); setSelectedIds((prev) => prev.includes(u.id) ? prev.filter((id) => id !== u.id) : [...prev, u.id]); }} className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:border-primary hover:text-primary">{selectedIds.includes(u.id) ? <CheckSquare size={14} /> : <Square size={14} />}</button></td>
                      <td><div className="flex items-center gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black ${selectedId === u.id ? "bg-primary text-white" : "bg-slate-100 text-slate-500"}`}>{u.fullName.charAt(0)}</div><div><p className="text-sm font-black text-slate-900">{u.fullName}</p><p className="text-xs text-slate-500">#{u.id} · {u.email}</p></div></div></td>
                      <td><span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600"><RoleIcon size={12} />{roleLabel(u.role)}</span></td>
                      <td><div className="flex flex-wrap gap-2"><Status text={u.blocked ? "موقوف" : "نشط"} tone={u.blocked ? "danger" : "success"} />{u.isVerified ? <Status text="موثق" tone="brand" /> : <Status text="غير موثق" tone="muted" />}</div></td>
                      <td><p className="text-sm font-black text-slate-900">{u.activityCount}</p><p className="text-xs text-slate-500">عمليات أساسية</p></td>
                      <td><span className="font-jakarta text-sm font-black text-slate-900">{formatCurrency(u.walletBalance)}</span></td>
                      <td><Risk score={u.riskScore} level={u.riskLevel} /></td>
                      <td><p className="text-xs text-slate-600">{formatDate(u.updatedAt)}</p></td>
                      <td className="text-left"><button onClick={(e) => { e.stopPropagation(); runAction([u.id], u.blocked ? "UNBLOCK" : "BLOCK"); }} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-600 hover:border-primary hover:text-primary">{u.blocked ? "تفعيل" : "إيقاف"}</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <AnimatePresence>
          {selected && (
            <motion.aside initial={{ x: 24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 24, opacity: 0 }} className="w-full xl:w-[420px] xl:sticky xl:top-24">
              <div className="glass-card p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><User size={20} /></div><div><p className="text-sm font-black text-slate-900">تفاصيل المستخدم</p><p className="text-xs font-bold text-slate-500">User Overview</p></div></div>
                  <button onClick={() => setSelectedId(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={16} /></button>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white text-lg font-black">{selected.fullName.charAt(0)}</div><div><h3 className="text-lg font-black text-slate-900">{selected.fullName}</h3><p className="text-xs text-slate-500">#{selected.id}</p></div></div>
                  <div className="mt-3 flex flex-wrap gap-2"><Status text={selected.blocked ? "موقوف" : "نشط"} tone={selected.blocked ? "danger" : "success"} />{selected.isVerified ? <Status text="موثق" tone="brand" /> : <Status text="غير موثق" tone="muted" />}</div>
                </div>
                <div className="space-y-2">
                  <Detail icon={Mail} label="البريد" value={selected.email} />
                  <Detail icon={Phone} label="الهاتف" value={selected.phone || "-"} />
                  <Detail icon={Activity} label="آخر نشاط" value={formatDate(selected.updatedAt)} />
                  <Detail icon={Wallet} label="المحفظة" value={formatCurrency(selected.walletBalance)} />
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="mb-2 flex items-center justify-between"><p className="text-xs font-black text-slate-500">تقييم المخاطر</p><Risk score={selected.riskScore} level={selected.riskLevel} /></div>
                  {selected.riskReasons.length ? selected.riskReasons.map((reason) => <p key={reason} className="text-xs text-slate-600">- {reason}</p>) : <p className="text-xs text-slate-500">لا توجد مؤشرات خطورة حالية.</p>}
                </div>
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3"><p className="text-xs font-black text-slate-500">الإجراء المقترح</p><p className="mt-1 text-sm font-bold text-slate-800">{selected.nextAction}</p></div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => runAction([selected.id], selected.isVerified ? "UNVERIFY" : "VERIFY")} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-black text-slate-700 hover:border-primary hover:text-primary">{selected.isVerified ? "إلغاء التوثيق" : "توثيق الحساب"}</button>
                  <button onClick={() => runAction([selected.id], selected.blocked ? "UNBLOCK" : "BLOCK")} className={`rounded-xl px-3 py-3 text-xs font-black ${selected.blocked ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"}`}>{selected.blocked ? "إعادة التفعيل" : "إيقاف الحساب"}</button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Kpi({ label, value, icon: Icon, highlight, danger }: { label: string; value: string | number; icon: typeof Users; highlight?: boolean; danger?: boolean }) {
  return (
    <div className={`rounded-2xl border bg-white p-4 sm:p-5 ${danger ? "border-rose-200" : highlight ? "border-primary/30" : "border-slate-200"}`}>
      <div className="mb-2 flex items-center justify-between"><p className="text-xs font-black text-slate-500">{label}</p><div className={`flex h-9 w-9 items-center justify-center rounded-lg ${danger ? "bg-rose-50 text-rose-600" : highlight ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}><Icon size={16} /></div></div>
      <p className="font-jakarta text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}

function Status({ text, tone }: { text: string; tone: "success" | "danger" | "brand" | "muted" }) {
  const styles: Record<"success" | "danger" | "brand" | "muted", string> = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    danger: "bg-rose-50 text-rose-700 border-rose-100",
    brand: "bg-primary/10 text-primary border-primary/20",
    muted: "bg-slate-100 text-slate-600 border-slate-200",
  };
  return <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${styles[tone]}`}>{text}</span>;
}

function Risk({ score, level }: { score: number; level: RiskLevel }) {
  const style = level === "مرتفع" ? "bg-rose-50 text-rose-700 border-rose-100" : level === "متوسط" ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-emerald-50 text-emerald-700 border-emerald-100";
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-black ${style}`}>{level} ({score})</span>;
}

function Detail({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
      <div className="flex items-center gap-2"><Icon size={13} className="text-slate-400" /><span className="text-xs font-black text-slate-500">{label}</span></div>
      <span className="text-xs font-bold text-slate-700">{value}</span>
    </div>
  );
}
