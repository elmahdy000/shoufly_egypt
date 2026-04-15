"use client";

import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  FiSearch,
  FiRefreshCw,
  FiUsers,
  FiShield,
  FiCheckCircle,
  FiBarChart2,
  FiTrendingUp,
  FiMail,
  FiPhone,
  FiClock,
  FiSlash,
  FiLoader,
  FiX,
  FiExternalLink,
  FiUser,
} from "react-icons/fi";

type VendorFilter = "ALL" | "ACTIVE" | "BLOCKED" | "VERIFIED";
type VendorAction = "block" | "unblock" | "verify" | "unverify";

interface Vendor {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  isVerified: boolean;
  walletBalance: string | number;
  createdAt: string;
}

interface ActionMsg {
  text: string;
  ok: boolean;
}

export default function AdminVendorsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VendorFilter>("ALL");
  const [selected, setSelected] = useState<Vendor | null>(null);
  const [actionLoading, setActionLoading] = useState<VendorAction | null>(null);
  const [actionMsg, setActionMsg] = useState<ActionMsg | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(new Date());

  const { data: vendors, loading, setData, refresh } = useAsyncData<Vendor[]>(
    async () => apiFetch<Vendor[]>("/api/admin/vendors?limit=100", "ADMIN"),
    []
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refresh();
    setLastSyncedAt(new Date());
    setTimeout(() => setIsRefreshing(false), 450);
  }, [refresh]);

  const stats = useMemo(() => {
    const all = vendors ?? [];
    const totalWallet = all.reduce((sum, vendor) => sum + Number(vendor.walletBalance), 0);
    return {
      total: all.length,
      active: all.filter((vendor) => vendor.isActive).length,
      blocked: all.filter((vendor) => !vendor.isActive).length,
      verified: all.filter((vendor) => vendor.isVerified).length,
      totalWallet,
      avgWallet: all.length ? totalWallet / all.length : 0,
    };
  }, [vendors]);

  const topVendor = useMemo(() => {
    const all = vendors ?? [];
    if (!all.length) return null;
    return [...all].sort((a, b) => Number(b.walletBalance) - Number(a.walletBalance))[0];
  }, [vendors]);

  const filtered = useMemo(() => {
    let list = vendors ?? [];
    if (statusFilter === "ACTIVE") list = list.filter((vendor) => vendor.isActive);
    if (statusFilter === "BLOCKED") list = list.filter((vendor) => !vendor.isActive);
    if (statusFilter === "VERIFIED") list = list.filter((vendor) => vendor.isVerified);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (vendor) =>
          vendor.fullName.toLowerCase().includes(q) ||
          vendor.email.toLowerCase().includes(q) ||
          (vendor.phone ?? "").includes(q)
      );
    }

    return list;
  }, [vendors, statusFilter, search]);

  const filterTabs = useMemo(
    () => [
      { id: "ALL" as const, label: "كل التجار", count: stats.total },
      { id: "ACTIVE" as const, label: "نشط", count: stats.active },
      { id: "VERIFIED" as const, label: "موثق", count: stats.verified },
      { id: "BLOCKED" as const, label: "موقوف", count: stats.blocked },
    ],
    [stats]
  );

  async function doAction(vendorId: number, action: VendorAction) {
    setActionLoading(action);
    setActionMsg(null);
    try {
      await apiFetch(`/api/admin/users/${vendorId}/moderation`, "ADMIN", {
        method: "PATCH",
        body: { action },
      });

      const patch: Partial<Vendor> = {};
      if (action === "block") patch.isActive = false;
      if (action === "unblock") patch.isActive = true;
      if (action === "verify") patch.isVerified = true;
      if (action === "unverify") patch.isVerified = false;

      setData((prev) => (prev ?? []).map((vendor) => (vendor.id === vendorId ? { ...vendor, ...patch } : vendor)));
      setSelected((prev) => (prev?.id === vendorId ? { ...prev, ...patch } : prev));
      setActionMsg({ text: "تم تحديث حالة التاجر بنجاح", ok: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "فشل تنفيذ الإجراء";
      setActionMsg({ text: message, ok: false });
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="admin-page admin-page--spacious" dir="rtl">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-3 py-1 text-xs font-black text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Vendor Command Center
            </span>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              إدارة <span className="text-primary">التجار</span> باحترافية
            </h1>
            <p className="max-w-2xl text-sm font-medium text-slate-600">
              شاشة موحدة لمتابعة الحسابات، فحص التوثيق، مراقبة المحافظ، وتنفيذ الإجراءات الحرجة بسرعة ومن مكان واحد.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-80 group">
              <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث بالاسم، البريد أو رقم الهاتف..."
                className="h-11 w-full rounded-xl border border-white/70 bg-white/80 pr-11 pl-4 text-sm outline-none transition-all focus:border-primary"
              />
            </div>
            <button
              onClick={handleRefresh}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/80 bg-white/85 px-4 text-sm font-bold text-slate-700 transition-all hover:border-primary hover:text-primary"
            >
              <FiRefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
              تحديث
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <KpiCard label="إجمالي التجار" value={stats.total} icon={FiUsers} />
          <KpiCard label="نشط حاليًا" value={stats.active} icon={FiTrendingUp} highlight />
          <KpiCard label="حسابات موثقة" value={stats.verified} icon={FiShield} />
          <KpiCard label="إجمالي المحافظ" value={formatCurrency(stats.totalWallet)} icon={FiBarChart2} />
          <KpiCard label="متوسط المحفظة" value={formatCurrency(stats.avgWallet)} icon={FiCheckCircle} />
        </div>
      </section>

      {topVendor && (
        <section className="glass-card p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-black tracking-wide text-slate-400">أعلى رصيد حالي</p>
              <p className="text-lg font-black text-slate-900">{topVendor.fullName}</p>
              <p className="text-xs font-bold text-slate-500">{topVendor.email}</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-2">
              <FiBarChart2 className="text-primary" size={16} />
              <span className="font-jakarta text-sm font-black text-primary">
                {formatCurrency(Number(topVendor.walletBalance))}
              </span>
            </div>
          </div>
        </section>
      )}

      <section className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-100 bg-white p-2 shadow-sm">
        {filterTabs.map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition-all ${
                isActive
                  ? "bg-primary text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-black ${
                  isActive ? "bg-white/25 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
        <span className="mr-auto text-xs font-bold text-slate-400">
          آخر تحديث: {lastSyncedAt.toLocaleTimeString("ar-EG")}
        </span>
      </section>

      <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-56 animate-pulse rounded-2xl border border-slate-100 bg-slate-50" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-20 text-center">
              <FiUsers size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-sm font-black text-slate-400">لا يوجد تجار مطابقون لخيارات البحث الحالية.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {filtered.map((vendor) => (
                <motion.button
                  key={vendor.id}
                  whileHover={{ y: -4 }}
                  onClick={() => {
                    setSelected(vendor);
                    setActionMsg(null);
                  }}
                  className={`glass-card p-5 text-right transition-all ${
                    selected?.id === vendor.id ? "ring-2 ring-primary/35 border-primary/40" : ""
                  }`}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black transition-all ${
                          selected?.id === vendor.id
                            ? "bg-primary text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {vendor.fullName.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-black text-slate-900">{vendor.fullName}</p>
                        <div className="flex items-center gap-2">
                          <StatusPill
                            text={vendor.isActive ? "نشط" : "موقوف"}
                            tone={vendor.isActive ? "success" : "danger"}
                          />
                          {vendor.isVerified && <StatusPill text="موثق" tone="brand" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 pt-3 text-xs font-bold text-slate-500">
                    <div className="flex items-center gap-2">
                      <FiMail size={13} className="text-slate-400" />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiPhone size={13} className="text-slate-400" />
                      <span>{vendor.phone || "غير متوفر"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiClock size={13} className="text-slate-400" />
                      <span>{formatDate(vendor.createdAt)}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-xl border border-primary/15 bg-primary/5 px-3 py-2">
                    <span className="text-xs font-black text-slate-500">الرصيد الحالي</span>
                    <span className="font-jakarta text-sm font-black text-primary">
                      {formatCurrency(Number(vendor.walletBalance))}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        <AnimatePresence>
          {selected && (
            <motion.aside
              initial={{ x: 28, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 28, opacity: 0 }}
              className="w-full xl:sticky xl:top-24 xl:w-[430px]"
            >
              <div className="glass-card p-6 sm:p-7 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <FiUser size={22} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">لوحة فحص التاجر</h2>
                      <p className="text-xs font-bold text-slate-500">Vendor Profile Inspector</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  >
                    <FiX size={18} />
                  </button>
                </div>

                <div className="rounded-2xl border border-primary/25 bg-primary p-5 text-white">
                  <p className="text-xs font-black text-white/80">إجمالي محفظة التاجر</p>
                  <p className="mt-2 font-jakarta text-3xl font-black">
                    {formatCurrency(Number(selected.walletBalance))}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <StatusPill
                      text={selected.isActive ? "نشط تشغيليًا" : "متوقف تشغيليًا"}
                      tone={selected.isActive ? "soft-success" : "soft-danger"}
                    />
                    <StatusPill text={selected.isVerified ? "موثق" : "غير موثق"} tone="soft-light" />
                  </div>
                </div>

                <div className="space-y-3">
                  <DetailRow label="الاسم" value={selected.fullName} />
                  <DetailRow label="البريد" value={selected.email} />
                  <DetailRow label="الهاتف" value={selected.phone || "غير متوفر"} />
                  <DetailRow label="تاريخ الانضمام" value={formatDate(selected.createdAt)} />
                </div>

                {actionMsg && (
                  <div
                    className={`rounded-xl border px-4 py-3 text-xs font-black ${
                      actionMsg.ok
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-rose-200 bg-rose-50 text-rose-700"
                    }`}
                  >
                    {actionMsg.text}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <ActionButton
                    label={selected.isVerified ? "إلغاء التوثيق" : "توثيق الحساب"}
                    icon={FiShield}
                    loading={actionLoading === "verify" || actionLoading === "unverify"}
                    onClick={() => doAction(selected.id, selected.isVerified ? "unverify" : "verify")}
                  />
                  <ActionButton
                    label={selected.isActive ? "إيقاف الحساب" : "إعادة التنشيط"}
                    icon={FiSlash}
                    loading={actionLoading === "block" || actionLoading === "unblock"}
                    danger={selected.isActive}
                    onClick={() => doAction(selected.id, selected.isActive ? "block" : "unblock")}
                  />
                </div>

                <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition-all hover:border-primary hover:text-primary">
                  عرض السجل المالي <FiExternalLink size={15} />
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

type KpiCardProps = {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  highlight?: boolean;
};

function KpiCard({ label, value, icon: Icon, highlight }: KpiCardProps) {
  return (
    <div
      className={`rounded-2xl border px-4 py-4 sm:px-5 ${
        highlight ? "border-primary/30 bg-white shadow-md" : "border-white/70 bg-white/75"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-black text-slate-500">{label}</p>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            highlight ? "bg-primary text-white" : "bg-primary/10 text-primary"
          }`}
        >
          <Icon size={16} />
        </div>
      </div>
      <p className={`font-jakarta text-xl font-black ${highlight ? "text-primary" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}

type StatusPillTone = "success" | "danger" | "brand" | "soft-success" | "soft-danger" | "soft-light";

function StatusPill({ text, tone }: { text: string; tone: StatusPillTone }) {
  const toneClass: Record<StatusPillTone, string> = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    danger: "bg-rose-50 text-rose-700 border-rose-100",
    brand: "bg-primary/10 text-primary border-primary/20",
    "soft-success": "bg-white/20 text-white border-white/25",
    "soft-danger": "bg-white/20 text-white border-white/25",
    "soft-light": "bg-white/20 text-white border-white/30",
  };

  return <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${toneClass[tone]}`}>{text}</span>;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
      <span className="text-xs font-black text-slate-500">{label}</span>
      <span className="text-xs font-bold text-slate-800">{value}</span>
    </div>
  );
}

type ActionButtonProps = {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  loading: boolean;
  onClick: () => void;
  danger?: boolean;
};

function ActionButton({ label, icon: Icon, loading, onClick, danger }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`rounded-xl border px-3 py-4 text-center transition-all ${
        danger
          ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
          : "border-slate-200 bg-white text-slate-700 hover:border-primary hover:text-primary"
      }`}
    >
      <div className="mb-2 flex justify-center">
        {loading ? <FiLoader className="animate-spin" size={16} /> : <Icon size={16} />}
      </div>
      <p className="text-xs font-black">{label}</p>
    </button>
  );
}
