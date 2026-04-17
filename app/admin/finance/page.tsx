"use client";

import { useMemo, useState } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { TrendingUp, TrendingDown, Wallet, Search, ArrowUpRight, ArrowDownRight, CreditCard } from "lucide-react";

interface Transaction {
  id: number;
  amount: number;
  type: "IN" | "OUT";
  description: string;
  status: string;
  createdAt: string;
}

const TYPE_CONFIG = {
  IN:  { label: "وارد",  cls: "bg-green-50 text-green-700 border-green-200", icon: ArrowUpRight,   iconCls: "text-green-600" },
  OUT: { label: "صادر", cls: "bg-red-50 text-red-700 border-red-200",       icon: ArrowDownRight, iconCls: "text-red-600"   },
};

const FILTERS = [
  { key: "ALL", label: "الكل" },
  { key: "IN",  label: "الواردات" },
  { key: "OUT", label: "الصادرات" },
];

export default function AdminFinancePage() {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const { data: transactions, loading } = useAsyncData<Transaction[]>(
    () => apiFetch("/api/admin/finance/transactions", "ADMIN"),
    []
  );

  const stats = useMemo(() => {
    const list = transactions ?? [];
    const totalIn  = list.filter(t => t.type === "IN").reduce((s, t) => s + t.amount, 0);
    const totalOut = list.filter(t => t.type === "OUT").reduce((s, t) => s + t.amount, 0);
    return { income: totalIn, expense: totalOut, net: totalIn - totalOut, count: list.length };
  }, [transactions]);

  const filtered = useMemo(() => {
    let list = transactions ?? [];
    if (filter !== "ALL") list = list.filter(t => t.type === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t => t.description?.toLowerCase().includes(q) || String(t.id).includes(q));
    }
    return list;
  }, [transactions, filter, search]);

  return (
    <div className="p-6 space-y-6" dir="rtl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">التقارير المالية</h1>
        <p className="text-sm text-gray-500 mt-1">رصد شامل للتدفقات النقدية والمعاملات المالية</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <CreditCard size={18} />
            </div>
            <span className="text-xs font-medium text-gray-400">{stats.count} معاملة</span>
          </div>
          <p className="text-xs font-medium text-gray-500 mb-1">إجمالي المعاملات</p>
          <p className="text-2xl font-bold text-gray-900">{stats.count}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 mb-1">إجمالي الواردات</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.income)}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
              <TrendingDown size={18} />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-500 mb-1">إجمالي الصادرات</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.expense)}</p>
        </div>

        <div className={`border rounded-xl p-5 shadow-sm ${stats.net >= 0 ? "bg-orange-50 border-orange-200" : "bg-red-50 border-red-200"}`}>
          <div className="flex items-center justify-between mb-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stats.net >= 0 ? "bg-orange-100 text-orange-600" : "bg-red-100 text-red-600"}`}>
              <Wallet size={18} />
            </div>
          </div>
          <p className={`text-xs font-medium mb-1 ${stats.net >= 0 ? "text-orange-700" : "text-red-700"}`}>صافي الربح</p>
          <p className={`text-2xl font-bold ${stats.net >= 0 ? "text-orange-900" : "text-red-900"}`}>{formatCurrency(stats.net)}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f.key
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
            placeholder="بحث في المعاملات..."
            className="w-full pr-9 pl-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">الوصف</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">النوع</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">المبلغ</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
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
                        <Wallet size={18} className="text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">لا توجد معاملات</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(tx => {
                  const cfg = TYPE_CONFIG[tx.type];
                  const Icon = cfg.icon;
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-mono text-gray-400">#{tx.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-800 font-medium max-w-xs truncate">{tx.description}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
                          <Icon size={12} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-sm font-bold ${tx.type === "IN" ? "text-green-700" : "text-red-700"}`}>
                        {tx.type === "IN" ? "+" : "−"}{formatCurrency(tx.amount)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{formatDate(tx.createdAt)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              عرض <span className="font-semibold text-gray-700">{filtered.length}</span> من <span className="font-semibold text-gray-700">{transactions?.length ?? 0}</span> معاملة
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
