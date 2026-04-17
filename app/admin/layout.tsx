"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import { listAllNotifications } from "@/lib/api/notifications";
import { NotificationsDrawer } from "@/components/admin/notifications-drawer";
import { AdminMobileNav } from "@/components/navigation/admin-mobile-nav";
import {
  BarChart3, Bell, Briefcase, CreditCard,
  LayoutGrid, LoaderCircle, LogOut, Menu,
  Package, Search, Shield, Truck, Users, X,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  openRequests: number;
  pendingWithdrawals: number;
  totalVendors: number;
}

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: keyof AdminStats;
};

const NAV: { title: string; items: NavItem[] }[] = [
  {
    title: "عام",
    items: [
      { label: "لوحة التحكم",    icon: LayoutGrid,  href: "/admin" },
      { label: "الطلبات",        icon: Package,     href: "/admin/requests",   badge: "openRequests" },
      { label: "تتبع التوصيل",   icon: Truck,       href: "/admin/tracking" },
      { label: "التحليلات",      icon: BarChart3,   href: "/admin/analytics" },
    ],
  },
  {
    title: "الإدارة",
    items: [
      { label: "المستخدمين",     icon: Users,       href: "/admin/users" },
      { label: "الموردين",       icon: Briefcase,   href: "/admin/vendors",    badge: "totalVendors" },
    ],
  },
  {
    title: "المالية",
    items: [
      { label: "التقارير المالية", icon: BarChart3, href: "/admin/finance" },
      { label: "طلبات السحب",    icon: CreditCard,  href: "/admin/withdrawals", badge: "pendingWithdrawals" },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();

  const [open,    setOpen]    = useState(false);
  const [notifOpen,setNotifOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [name,    setName]    = useState("مدير النظام");
  const [stats,   setStats]   = useState<AdminStats | null>(null);
  const [unread,  setUnread]  = useState(0);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    apiFetch<AdminStats>("/api/admin/stats", "ADMIN").then(setStats).catch(() => {});
    listAllNotifications("ADMIN").then(n => setUnread(n.filter(x => !x.isRead).length)).catch(() => {});
    apiFetch<{ fullName?: string }>("/api/auth/me", "ADMIN").then(u => u?.fullName && setName(u.fullName)).catch(() => {});
  }, []);

  const logout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
  };

  const badge = (key?: keyof AdminStats) => key && stats ? (stats[key] ?? 0) : 0;

  const currentPage = NAV.flatMap(g => g.items).find(item =>
    item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
  );

  const Sidebar = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col h-full w-64 bg-white border-l border-gray-100" dir="rtl">

      {/* Brand */}
      <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 sm:w-9 h-8 sm:h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow-sm shadow-orange-200 shrink-0">
            <Shield size={14} className="text-white sm:hidden" />
            <Shield size={16} className="text-white hidden sm:block" />
          </div>
          <div className="min-w-0">
            <p className="text-sm sm:text-[15px] font-bold text-gray-900 leading-none tracking-tight truncate">Shoofly</p>
            <p className="text-[9px] sm:text-[10px] text-gray-400 leading-none mt-0.5 sm:mt-1 font-medium">Admin Panel</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="w-6 sm:w-7 h-6 sm:h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors shrink-0">
            <X size={12} className="sm:hidden" />
            <X size={14} className="hidden sm:block" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 sm:py-4 px-2 sm:px-3 space-y-4 sm:space-y-6">
        {NAV.map(group => (
          <div key={group.title}>
            <p className="px-2 sm:px-2.5 pb-1.5 sm:pb-2 text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                const count  = badge(item.badge);
                const Icon   = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl text-[12px] sm:text-[13.5px] font-medium transition-all duration-150 group ${
                      active
                        ? "bg-orange-50 text-orange-600"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                  >
                    {active && (
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-orange-500 rounded-l-full" />
                    )}
                    <Icon
                      size={14}
                      className={`shrink-0 transition-colors hidden sm:block ${active ? "text-orange-500" : "text-gray-400 group-hover:text-gray-500"}`}
                    />
                    <Icon
                      size={12}
                      className={`shrink-0 transition-colors sm:hidden ${active ? "text-orange-500" : "text-gray-400 group-hover:text-gray-500"}`}
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    {count > 0 && (
                      <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 ${
                        active ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                        {count > 99 ? "99+" : count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="shrink-0 p-2 sm:p-3 border-t border-gray-100">
        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-default">
          <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold shrink-0 shadow-sm">
            {name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] sm:text-[13px] font-semibold text-gray-900 leading-none truncate">{name}</p>
            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5 sm:mt-1 leading-none">مسؤول النظام</p>
          </div>
          <button
            onClick={logout}
            disabled={loggingOut}
            title="تسجيل الخروج"
            className="w-6 sm:w-7 h-6 sm:h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40 shrink-0"
          >
            {loggingOut
              ? <LoaderCircle size={11} className="animate-spin sm:hidden" />
              : <LogOut size={11} className="sm:hidden" />}
            {loggingOut
              ? <LoaderCircle size={13} className="animate-spin hidden sm:block" />
              : <LogOut size={13} className="hidden sm:block" />}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f8f8f7]" dir="rtl">

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex shrink-0 sticky top-0 h-screen z-30 shadow-[1px_0_0_0_#f0f0ee]">
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 h-screen w-64 shadow-2xl">
            <Sidebar onClose={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Topbar */}
        <header className="sticky top-0 z-20 h-14 px-4 sm:px-6 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between gap-4">

          {/* Right side: hamburger + breadcrumb */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
            >
              <Menu size={16} />
            </button>

            {/* Breadcrumb - hidden on xs */}
            <div className="hidden sm:flex items-center gap-2 text-sm min-w-0">
              <span className="text-gray-400 font-medium truncate">الرئيسية</span>
              {currentPage && currentPage.href !== "/admin" && (
                <>
                  <span className="text-gray-300">/</span>
                  <span className="text-gray-800 font-semibold truncate">{currentPage.label}</span>
                </>
              )}
              {(!currentPage || currentPage.href === "/admin") && (
                <span className="text-gray-800 font-semibold">لوحة التحكم</span>
              )}
            </div>
          </div>

          {/* Left side: search + notifications + avatar */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">

            {/* Search - hidden on xs */}
            <div className="relative hidden sm:block">
              <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="بحث..."
                className="h-8 w-40 md:w-48 bg-gray-50 border border-gray-200 rounded-lg pr-8 pl-3 text-[13px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:w-48 md:focus:w-56 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all duration-300"
              />
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-gray-200 mx-0.5 sm:mx-1 hidden sm:block" />

            {/* Notifications */}
            <button
              onClick={() => setNotifOpen(true)}
              className="relative w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-orange-500 transition-colors shrink-0"
            >
              <Bell size={15} />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] rounded-full bg-orange-500 ring-2 ring-white" />
              )}
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-gray-200 mx-0.5 sm:mx-1" />

            {/* Avatar */}
            <div className="flex items-center gap-2 sm:gap-2.5 pl-0 sm:pl-1">
              <div className="hidden sm:block text-right">
                <p className="text-[12px] font-semibold text-gray-900 leading-none">{name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-none">Administrator</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-[13px] font-bold shadow-sm shadow-orange-200 shrink-0">
                {name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      <AdminMobileNav />
      <NotificationsDrawer isOpen={notifOpen} onClose={() => setNotifOpen(false)} onUnreadCountChange={setUnread} />
    </div>
  );
}
