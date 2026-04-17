"use client";

import { useCallback, useMemo, useState } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Search, Store, ShieldCheck, ShieldAlert, Ban, CheckCircle, RefreshCw, MoreHorizontal, Wallet } from "lucide-react";

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

type VendorFilter = "ALL" | "ACTIVE" | "BLOCKED" | "VERIFIED";

const FILTERS: { key: VendorFilter; label: string }[] = [
  { key: "ALL",      label: "الكل"       },
  { key: "ACTIVE",   label: "نشط"        },
  { key: "VERIFIED", label: "موثق"       },
  { key: "BLOCKED",  label: "محظور"      },
];

export default function AdminVendorsPage() {
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState<VendorFilter>("ALL");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: vendors, loading, refresh } = useAsyncData<Vendor[]>(
    () => apiFetch<Vendor[]>("/api/admin/vendors?limit=100", "ADMIN"),
    []
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 500);
  }, [refresh]);

  const stats = useMemo(() => {
    const all = vendors ?? [];
    return {
      total:       all.length,
      active:      all.filter(v => v.isActive).length,
      verified:    all.filter(v => v.isVerified).length,
      blocked:     all.filter(v => !v.isActive).length,
      totalWallet: all.reduce((s, v) => s + Number(v.walletBalance), 0),
    };
  }, [vendors]);

  const filtered = useMemo(() => {
    let list = vendors ?? [];
    if (statusFilter === "ACTIVE")   list = list.filter(v => v.isActive);
    if (statusFilter === "BLOCKED")  list = list.filter(v => !v.isActive);
    if (statusFilter === "VERIFIED") list = list.filter(v => v.isVerified);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(v =>
        v.fullName?.toLowerCase().includes(q) ||
        v.email?.toLowerCase().includes(q) ||
        v.phone?.includes(q)
      );
    }
    return list;
  }, [vendors, statusFilter, search]);

  return (
    <div className="p-6 space-y-6" dir="rtl">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الموردين</h1>
          <p className="text-sm text-gray-500 mt-1">مراجعة ومتابعة حسابات الموردين المسجلين في المنصة</p>
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
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        {[
          { label: "إجمالي الموردين",  value: stats.total,    icon: Store,       bg: "bg-blue-50",   iconCls: "text-blue-600"   },
          { label: "نشط",              value: stats.active,   icon: CheckCircle, bg: "bg-green-50",  iconCls: "text-green-600"  },
          { label: "موثق",             value: stats.verified, icon: ShieldCheck, bg: "bg-orange-50", iconCls: "text-orange-600" },
          { label: "محظور",            value: stats.blocked,  icon: Ban,         bg: "bg-red-50",    iconCls: "text-red-600"    },
          { label: "إجمالي المحافظ",   value: formatCurrency(stats.totalWallet), icon: Wallet, bg: "bg-gray-50", iconCls: "text-gray-600", wide: true },
        ].map(({ label, value, icon: Icon, bg, iconCls, wide }) => (
          <div key={label} className={`bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm ${wide ? "sm:col-span-2 lg:col-span-1" : ""}`}>
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center ${iconCls} shrink-0`}>
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
            placeholder="ابحث عن مورد..."
            className="w-full pr-9 pl-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">المورد</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">البريد</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">الرصيد</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">الحالة</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">التسجيل</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : !filtered.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Store size={18} className="text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">لا يوجد موردين في هذه الفئة</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(vendor => (
                  <tr key={vendor.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm shrink-0">
                          {vendor.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{vendor.fullName}</p>
                          <p className="text-xs text-gray-400">{vendor.phone ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{vendor.email}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(Number(vendor.walletBalance))}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {vendor.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                            <CheckCircle size={11} /> نشط
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                            <Ban size={11} /> محظور
                          </span>
                        )}
                        {vendor.isVerified && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <ShieldCheck size={11} /> موثق
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDate(vendor.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition opacity-0 group-hover:opacity-100">
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              عرض <span className="font-semibold text-gray-700">{filtered.length}</span> من <span className="font-semibold text-gray-700">{vendors?.length ?? 0}</span> مورد
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
