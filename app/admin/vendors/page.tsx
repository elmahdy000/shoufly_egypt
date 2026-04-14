"use client";

import { useState, useMemo } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatCurrency } from "@/lib/formatters";
import {
  FiSearch, FiX, FiPhone, FiCalendar, FiDollarSign,
  FiStar, FiSlash, FiCheckCircle, FiAlertCircle, FiLoader,
  FiBriefcase, FiTag, FiUsers, FiTrendingUp, FiShield
} from "react-icons/fi";

interface VendorCategory {
  category: { name: string };
}

interface Vendor {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  isVerified: boolean;
  walletBalance: string | number;
  createdAt: string;
  vendorCategories: VendorCategory[];
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

function CategoryTag({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-semibold rounded-lg border border-slate-200">
      <FiTag size={9} />
      {name}
    </span>
  );
}

function VendorInitial({ name }: { name: string }) {
  const colors = [
    "bg-amber-100 text-amber-700",
    "bg-blue-100 text-blue-700",
    "bg-emerald-100 text-emerald-700",
    "bg-violet-100 text-violet-700",
    "bg-rose-100 text-rose-700",
    "bg-indigo-100 text-indigo-700",
  ];
  const idx = (name.charCodeAt(0) ?? 0) % colors.length;
  return (
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-base shrink-0 ${colors[idx]}`}>
      {name.charAt(0)}
    </div>
  );
}

export default function AdminVendorsPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Vendor | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const { data: vendors, loading, error, setData } = useAsyncData<Vendor[]>(
    async () => {
      const PAGE = 100;
      const results: Vendor[] = [];
      let offset = 0;
      while (true) {
        const page = await apiFetch<Vendor[]>(
          `/api/admin/vendors?limit=${PAGE}&offset=${offset}`,
          "ADMIN"
        );
        results.push(...page);
        if (page.length < PAGE) break;
        offset += PAGE;
      }
      return results;
    },
    []
  );

  const filtered = useMemo(() => {
    const list = vendors ?? [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((v) =>
      v.fullName?.toLowerCase().includes(q) ||
      v.email?.toLowerCase().includes(q)
    );
  }, [vendors, search]);

  const stats = useMemo(() => {
    const all = vendors ?? [];
    const active = all.filter((v) => v.isActive).length;
    const totalWallet = all.reduce((sum, v) => sum + Number(v.walletBalance), 0);
    return { total: all.length, active, totalWallet };
  }, [vendors]);

  async function doAction(vendorId: number, action: string) {
    setActionLoading(action);
    setActionMsg(null);
    try {
      await apiFetch<any>(`/api/admin/users/${vendorId}/moderation`, "ADMIN", {
        method: "PATCH", body: { action },
      });
      const patch: Partial<Vendor> = {};
      if (action === "BLOCK") patch.isActive = false;
      if (action === "UNBLOCK") patch.isActive = true;
      if (action === "VERIFY") patch.isVerified = true;
      if (action === "UNVERIFY") patch.isVerified = false;
      setData((prev: Vendor[]) =>
        (prev ?? []).map((v) => v.id === vendorId ? { ...v, ...patch } : v)
      );
      setSelected((prev) => prev?.id === vendorId ? { ...prev, ...patch } as Vendor : prev);
      setActionMsg({ text: "تم تنفيذ الإجراء بنجاح ✓", ok: true });
    } catch (e: any) {
      setActionMsg({ text: e.message ?? "فشل تنفيذ الإجراء", ok: false });
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-5 text-right" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">إدارة التجار</h1>
        <p className="text-sm text-slate-400 mt-0.5">اضغط على بطاقة التاجر لعرض التفاصيل وتنفيذ الإجراءات</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
            <FiUsers size={18} className="text-slate-600" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">إجمالي التجار</p>
            <p className="text-2xl font-black text-slate-900 leading-none mt-0.5">
              {loading ? <span className="text-slate-300">—</span> : stats.total}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
            <FiTrendingUp size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">التجار النشطون</p>
            <p className="text-2xl font-black text-amber-600 leading-none mt-0.5">
              {loading ? <span className="text-slate-300">—</span> : stats.active}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
            <FiDollarSign size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">إجمالي المحافظ</p>
            <p className="text-xl font-black text-emerald-600 leading-none mt-0.5">
              {loading ? <span className="text-slate-300">—</span> : formatCurrency(stats.totalWallet)}
            </p>
          </div>
        </div>
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
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
          >
            <FiX size={14} />
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm border border-rose-200">
          خطأ في تحميل البيانات
        </div>
      )}

      {/* Grid + Detail Panel */}
      <div className="flex gap-5 items-start">
        {/* Card Grid */}
        <div className={`flex-1 min-w-0 ${selected ? "hidden lg:block" : ""}`}>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-slate-100 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-slate-100 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                  <div className="h-8 bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-slate-200">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                <FiBriefcase size={24} className="text-slate-300" />
              </div>
              <p className="text-slate-500 font-semibold text-sm">لا يوجد تجار</p>
              {search && <p className="text-slate-400 text-xs">جرّب تغيير كلمة البحث</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((v) => {
                const cats = v.vendorCategories?.map((vc) => vc.category.name) ?? [];
                const isSelected = selected?.id === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => { setSelected(v); setActionMsg(null); }}
                    className={`w-full text-right bg-white rounded-2xl border p-5 flex flex-col gap-3 transition-all hover:border-slate-300 hover:bg-stone-50 ${
                      isSelected ? "border-primary ring-1 ring-primary/20" : "border-slate-200"
                    }`}
                  >
                    {/* Top Row */}
                    <div className="flex items-start gap-3">
                      <VendorInitial name={v.fullName} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-slate-900 text-sm leading-tight truncate">{v.fullName}</p>
                          {v.isVerified && (
                            <FiShield size={12} className="text-emerald-500 shrink-0" title="موثّق" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{v.email}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 mt-0.5 ${
                        v.isActive ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-rose-50 text-rose-600 border border-rose-200"
                      }`}>
                        {v.isActive ? "نشط" : "موقوف"}
                      </span>
                    </div>

                    {/* Wallet */}
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-xs text-slate-400">رصيد المحفظة</span>
                      <span className="font-black text-slate-900 text-sm">{formatCurrency(Number(v.walletBalance))}</span>
                    </div>

                    {/* Categories */}
                    {cats.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {cats.slice(0, 3).map((c) => <CategoryTag key={c} name={c} />)}
                        {cats.length > 3 && (
                          <span className="text-[10px] text-slate-400 font-semibold px-1.5 self-center">+{cats.length - 3}</span>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-300 italic">لا توجد تصنيفات</p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          {!loading && vendors && (
            <p className="text-xs text-slate-400 mt-3 text-center">
              {filtered.length} من أصل {vendors.length} تاجر
            </p>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div
            className="w-full lg:w-[380px] shrink-0 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col"
            style={{ maxHeight: "calc(100vh - 200px)" }}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-800 text-sm">ملف التاجر</h3>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 transition-colors"
              >
                <FiX size={16} />
              </button>
            </div>

            <div className="overflow-y-auto p-4 space-y-4 flex-1">
              {/* Profile Hero */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                <VendorInitial name={selected.fullName} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-900 truncate">{selected.fullName}</h4>
                    {selected.isVerified && (
                      <FiShield size={13} className="text-emerald-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{selected.email}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${
                      selected.isActive
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-rose-50 text-rose-600 border-rose-200"
                    }`}>
                      {selected.isActive ? "✓ نشط" : "✗ موقوف"}
                    </span>
                    {selected.isVerified && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-200">
                        ✓ موثّق
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl col-span-2">
                  <p className="text-xs text-amber-600/70 flex items-center gap-1 mb-1">
                    <FiDollarSign size={11} />رصيد المحفظة
                  </p>
                  <p className="font-black text-amber-700 text-xl">{formatCurrency(Number(selected.walletBalance))}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                    <FiCalendar size={11} />تاريخ الانضمام
                  </p>
                  <p className="font-bold text-slate-800 text-xs">
                    {new Date(selected.createdAt).toLocaleDateString("ar-EG")}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-400 mb-1">رقم التاجر</p>
                  <p className="font-mono font-black text-slate-900">#{selected.id}</p>
                </div>
                {selected.phone && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
                    <p className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                      <FiPhone size={11} />رقم الهاتف
                    </p>
                    <p className="font-bold text-slate-800 text-sm" dir="ltr">{selected.phone}</p>
                  </div>
                )}
              </div>

              {/* Categories */}
              {selected.vendorCategories?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">التصنيفات</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.vendorCategories.map((vc) => (
                      <CategoryTag key={vc.category.name} name={vc.category.name} />
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback */}
              {actionMsg && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  actionMsg.ok
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}>
                  {actionMsg.ok ? <FiCheckCircle size={13} /> : <FiAlertCircle size={13} />}
                  {actionMsg.text}
                </div>
              )}

              {/* Moderation Actions */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">إجراءات الإشراف</p>
                <div className="space-y-2">
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
                  {selected.isActive ? (
                    <ActionBtn
                      icon={<FiSlash size={15} />}
                      label="تعليق الحساب"
                      color="bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
                      loading={actionLoading === "BLOCK"}
                      onClick={() => doAction(selected.id, "BLOCK")}
                    />
                  ) : (
                    <ActionBtn
                      icon={<FiCheckCircle size={15} />}
                      label="إعادة تفعيل الحساب"
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
