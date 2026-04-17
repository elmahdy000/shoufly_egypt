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

  const Sidebar = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col h-full w-64 bg-white border-l border-gray-200" dir="rtl">

      {/* Brand */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm">
            <Shield size={15} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-none">Shoofly</p>
            <p className="text-[10px] text-gray-400 leading-none mt-0.5">لوحة الإدارة</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        {NAV.map(group => (
          <div key={group.title}>
            <p className="px-2 pb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
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
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group ${
                      active
                        ? "bg-orange-50 text-orange-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon size={15} className={`shrink-0 ${active ? "text-orange-500" : "text-gray-400 group-hover:text-gray-600"}`} />
                    <span className="flex-1 leading-none">{item.label}</span>
                    {count > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
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

      {/* Footer */}
      <div className="shrink-0 p-3 border-t border-gray-100 space-y-1">
        <div className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg bg-gray-50">
          <div className="w-7 h-7 rounded-md bg-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-gray-900 leading-none truncate">{name}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">مسؤول النظام</p>
          </div>
        </div>
        <button
          onClick={logout}
          disabled={loggingOut}
          className="flex w-full items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
        >
          {loggingOut
            ? <LoaderCircle size={14} className="animate-spin shrink-0" />
            : <LogOut size={14} className="shrink-0" />}
          {loggingOut ? "جاري الخروج..." : "تسجيل الخروج"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50" dir="rtl">

      {/* Desktop sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-0 h-screen z-30">
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 h-full shadow-xl">
            <Sidebar onClose={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Topbar */}
        <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Menu size={17} />
            </button>
            <div className="relative hidden md:block">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="بحث في النظام..."
                className="h-9 w-60 bg-gray-50 border border-gray-200 rounded-lg pr-9 pl-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setNotifOpen(true)}
              className="relative w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-orange-500 transition-colors"
            >
              <Bell size={16} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500 border border-white" />
              )}
            </button>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                {name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <p className="text-[13px] font-semibold text-gray-900 leading-none">{name}</p>
                <p className="text-[10px] text-gray-400">مسؤول</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>

      <AdminMobileNav />
      <NotificationsDrawer isOpen={notifOpen} onClose={() => setNotifOpen(false)} onUnreadCountChange={setUnread} />
    </div>
  );
}
