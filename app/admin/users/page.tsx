"use client";

import { useState, useMemo } from "react";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { apiFetch } from "@/lib/api/client";
import { Search, Users, Briefcase, Shield, Truck, MoreVertical, ShoppingCart, Store } from "lucide-react";

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
    <div className="space-y-4 sm:space-y-5 md:space-y-6 min-h-screen" dir="rtl">

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">إدارة المستخدمين</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">إدارة جميع حسابات المنصة</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 safe-gap">
        {[
          { label: "إجمالي",        count: counts.all,      icon: Users,         bg: "bg-white",   color: "text-gray-900",   iconBg: "bg-gray-100",     iconColor: "text-gray-700"     },
          { label: "العملاء",       count: counts.client,   icon: ShoppingCart,  bg: "bg-white",   color: "text-gray-900",   iconBg: "bg-blue-100",     iconColor: "text-blue-700"     },
          { label: "الموردين",      count: counts.vendor,   icon: Store,         bg: "bg-white",   color: "text-gray-900",   iconBg: "bg-orange-100",   iconColor: "text-orange-700"   },
          { label: "مندوبي التوصيل",count: counts.delivery, icon: Truck,         bg: "bg-white",   color: "text-gray-900",   iconBg: "bg-green-100",    iconColor: "text-green-700"    },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="card-container card-pad card-min-h flex flex-col justify-between"
            >
              <div className={`icon-box ${s.iconBg} mb-2 md:mb-3`}>
                <Icon size={16} className={`${s.iconColor}`} strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-metric ${s.color} line-clamp-1`}>
                  {loading ? "—" : s.count.toLocaleString("ar-EG")}
                </p>
                <p className="text-label text-gray-600 truncate">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 sm:right-4" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو البريد الإلكتروني..."
            className="w-full h-9 sm:h-10 bg-white border border-gray-200 rounded-lg pr-9 sm:pr-10 pl-3 sm:pl-4 text-xs sm:text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="h-9 sm:h-10 bg-white border border-gray-200 rounded-lg px-2 sm:px-3 text-xs sm:text-sm text-gray-700 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
        >
          <option value="all">جميع الأدوار</option>
          <option value="admin">مسؤول</option>
          <option value="client">عميل</option>
          <option value="vendor">مورد</option>
          <option value="delivery">مندوب توصيل</option>
        </select>
      </div>

      {/* Table */}
      <div className="card-container overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["المستخدم", "البريد الإلكتروني", "الدور", "المدينة", "تاريخ الانضمام", ""].map(h => (
                  <th key={h} className="px-3 sm:px-5 py-2.5 sm:py-3 text-[9px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td colSpan={6} className="px-3 sm:px-5 py-2.5 sm:py-3">
                        <div className="h-3 sm:h-4 bg-gray-100 rounded-md animate-pulse" style={{ width: `${50 + i * 8}%` }} />
                      </td>
                    </tr>
                  ))
                : filtered.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} className="px-3 sm:px-5 py-6 sm:py-8 text-center text-xs sm:text-sm text-gray-400">
                        لا يوجد مستخدمين مطابقين للبحث
                      </td>
                    </tr>
                  )
                  : filtered.map(user => {
                      const role = ROLE_CONFIG[user.role?.toLowerCase()] ?? { label: user.role, cls: "bg-gray-100 text-gray-600 border border-gray-200", icon: Users };
                      const RoleIcon = role.icon;
                      return (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                          <td className="px-3 sm:px-5 py-2.5 sm:py-3">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 text-white flex items-center justify-center text-[11px] sm:text-[13px] font-bold shrink-0 shadow-sm">
                                {user.fullName?.charAt(0) ?? "U"}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[12px] sm:text-[13px] font-semibold text-gray-900 leading-none truncate">{user.fullName}</p>
                                <p className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5">#{user.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="hidden md:table-cell px-3 sm:px-5 py-2.5 sm:py-3 text-[12px] sm:text-[13px] text-gray-600 truncate">{user.email}</td>
                          <td className="px-3 sm:px-5 py-2.5 sm:py-3">
                            <span className={`inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[11px] font-semibold whitespace-nowrap ${role.cls}`}>
                              <RoleIcon size={8} className="hidden sm:block" />
                              <RoleIcon size={6} className="sm:hidden" />
                              {role.label}
                            </span>
                          </td>
                          <td className="hidden lg:table-cell px-3 sm:px-5 py-2.5 sm:py-3 text-[12px] sm:text-[13px] text-gray-500">{user.city ?? "—"}</td>
                          <td className="hidden md:table-cell px-3 sm:px-5 py-2.5 sm:py-3 text-[10px] sm:text-[12px] text-gray-400 whitespace-nowrap">
                            {new Date(user.createdAt).toLocaleDateString("ar-EG")}
                          </td>
                          <td className="px-3 sm:px-5 py-2.5 sm:py-3">
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
          <div className="px-3 sm:px-5 py-2.5 sm:py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <p className="text-xs sm:text-sm text-gray-600">
              عرض <span className="font-semibold text-gray-900">{filtered.length}</span> من{" "}
              <span className="font-semibold text-gray-900">{users?.length ?? 0}</span> مستخدم
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
