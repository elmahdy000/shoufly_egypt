"use client";

import { useState, useMemo } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { Search, Users, Briefcase, Shield, Truck, MoreVertical } from "lucide-react";

interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  city?: string;
  createdAt: string;
  isActive?: boolean;
}

const ROLE_CONFIG: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  admin:    { label: "مسؤول",            cls: "bg-purple-50 text-purple-700 border border-purple-200", icon: Shield   },
  client:   { label: "عميل",             cls: "bg-blue-50 text-blue-700 border border-blue-200",       icon: Users    },
  vendor:   { label: "مورد",             cls: "bg-orange-50 text-orange-700 border border-orange-200", icon: Briefcase},
  delivery: { label: "مندوب توصيل",      cls: "bg-green-50 text-green-700 border border-green-200",    icon: Truck    },
};

export default function AdminUsersPage() {
  const [search,     setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const { data: users, loading } = useAsyncData<User[]>(
    () => apiFetch("/api/admin/users", "ADMIN"),
    []
  );

  const filtered = useMemo(() => (users ?? []).filter(u => {
    const q = search.toLowerCase();
    const matchSearch = u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole   = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  }), [users, search, roleFilter]);

  const counts = useMemo(() => ({
    all:      users?.length ?? 0,
    client:   users?.filter(u => u.role === "client").length   ?? 0,
    vendor:   users?.filter(u => u.role === "vendor").length   ?? 0,
    delivery: users?.filter(u => u.role === "delivery").length ?? 0,
    admin:    users?.filter(u => u.role === "admin").length    ?? 0,
  }), [users]);

  return (
    <div className="p-6 lg:p-8 space-y-6 min-h-screen" dir="rtl">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">إدارة المستخدمين</h1>
        <p className="text-sm text-gray-500 mt-0.5">إدارة جميع حسابات المنصة</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "إجمالي",        count: counts.all,      color: "text-gray-900",   bg: "bg-gray-50",    border: "border-gray-200" },
          { label: "العملاء",       count: counts.client,   color: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-200"  },
          { label: "الموردين",      count: counts.vendor,   color: "text-orange-700", bg: "bg-orange-50",  border: "border-orange-200"},
          { label: "مندوبي التوصيل",count: counts.delivery, color: "text-green-700",  bg: "bg-green-50",   border: "border-green-200" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-4`}>
            <p className={`text-2xl font-bold ${s.color}`}>{loading ? "—" : s.count.toLocaleString("ar-EG")}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو البريد الإلكتروني..."
            className="w-full h-9 bg-white border border-gray-200 rounded-lg pr-9 pl-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="h-9 bg-white border border-gray-200 rounded-lg px-3 text-sm text-gray-700 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
        >
          <option value="all">جميع الأدوار</option>
          <option value="admin">مسؤول</option>
          <option value="client">عميل</option>
          <option value="vendor">مورد</option>
          <option value="delivery">مندوب توصيل</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-gray-100">
                {["المستخدم", "البريد الإلكتروني", "الدور", "المدينة", "تاريخ الانضمام", ""].map(h => (
                  <th key={h} className="px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/60 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td colSpan={6} className="px-5 py-4">
                        <div className="h-4 bg-gray-100 rounded-md animate-pulse" style={{ width: `${50 + i * 8}%` }} />
                      </td>
                    </tr>
                  ))
                : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-14 text-center text-sm text-gray-400">
                        لا يوجد مستخدمين مطابقين للبحث
                      </td>
                    </tr>
                  )
                  : filtered.map(user => {
                      const role = ROLE_CONFIG[user.role?.toLowerCase()] ?? { label: user.role, cls: "bg-gray-100 text-gray-600 border border-gray-200", icon: Users };
                      const RoleIcon = role.icon;
                      return (
                        <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors group">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center text-[13px] font-bold shrink-0 shadow-sm">
                                {user.fullName?.charAt(0) ?? "U"}
                              </div>
                              <div>
                                <p className="text-[13px] font-semibold text-gray-900 leading-none">{user.fullName}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">#{user.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-[13px] text-gray-600">{user.email}</td>
                          <td className="px-5 py-3.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${role.cls}`}>
                              <RoleIcon size={10} />
                              {role.label}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-[13px] text-gray-500">{user.city ?? "—"}</td>
                          <td className="px-5 py-3.5 text-[12px] text-gray-400 whitespace-nowrap">
                            {new Date(user.createdAt).toLocaleDateString("ar-EG")}
                          </td>
                          <td className="px-5 py-3.5">
                            <button className="w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100">
                              <MoreVertical size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              عرض <span className="font-semibold text-gray-900">{filtered.length}</span> من{" "}
              <span className="font-semibold text-gray-900">{users?.length ?? 0}</span> مستخدم
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
