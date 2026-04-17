"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import { listAllNotifications } from "@/lib/api/notifications";
import { NotificationsDrawer } from "@/components/admin/notifications-drawer";
import { AdminMobileNav } from "@/components/navigation/admin-mobile-nav";
import {
  BarChart3,
  Bell,
  Briefcase,
  CreditCard,
  LayoutGrid,
  LoaderCircle,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  Shield,
  Truck,
  Users,
  X,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: keyof AdminStats;
};

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "الرئيسية",
    items: [
      { label: "لوحة التحكم", icon: LayoutGrid, href: "/admin" },
      { label: "الطلبات", icon: Package, href: "/admin/requests", badge: "openRequests" },
      { label: "تتبع التوصيل", icon: Truck, href: "/admin/tracking" },
      { label: "التحليلات", icon: BarChart3, href: "/admin/analytics" },
    ],
  },
  {
    label: "الإدارة",
    items: [
      { label: "المستخدمين", icon: Users, href: "/admin/users" },
      { label: "الموردين", icon: Briefcase, href: "/admin/vendors", badge: "totalVendors" },
    ],
  },
  {
    label: "المالية",
    items: [
      { label: "التقارير المالية", icon: BarChart3, href: "/admin/finance" },
      { label: "طلبات السحب", icon: CreditCard, href: "/admin/withdrawals", badge: "pendingWithdrawals" },
    ],
  },
];

interface AdminStats {
  totalUsers: number;
  openRequests: number;
  pendingWithdrawals: number;
  totalVendors: number;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [adminName, setAdminName] = useState("مدير النظام");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    apiFetch<AdminStats>("/api/admin/stats", "ADMIN").then(setStats).catch(() => {});
    listAllNotifications("ADMIN")
      .then((list) => setNotifCount(list.filter((i) => !i.isRead).length))
      .catch(() => {});
    apiFetch<{ fullName?: string }>("/api/auth/me", "ADMIN")
      .then((u) => u?.fullName && setAdminName(u.fullName))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getBadge = (key?: keyof AdminStats) =>
    key && stats ? (stats[key] ?? 0) : 0;

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex h-full flex-col bg-white border-l border-gray-200" dir="rtl">

      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shadow-sm">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <p className="text-base font-bold text-gray-900 leading-none">Shoofly</p>
            <p className="text-[10px] text-gray-400 mt-0.5 font-medium">لوحة الإدارة</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-6">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href));
                const badge = getBadge(item.badge);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-orange-50 text-orange-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon
                      size={17}
                      className={`shrink-0 transition-colors ${
                        isActive
                          ? "text-orange-500"
                          : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    />
                    <span className="flex-1 leading-none">{item.label}</span>
                    {badge > 0 && (
                      <span
                        className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${
                          isActive
                            ? "bg-orange-500 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {badge > 99 ? "99+" : badge}
                      </span>
                    )}
                    {isActive && (
                      <div className="w-1 h-4 rounded-full bg-orange-500 absolute right-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        {/* User Card */}
        <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-gray-50">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {adminName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 leading-none truncate">
              {adminName}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">مسؤول النظام</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
        >
          {isLoggingOut ? (
            <LoaderCircle size={17} className="animate-spin shrink-0" />
          ) : (
            <LogOut size={17} className="shrink-0" />
          )}
          {isLoggingOut ? "جاري الخروج..." : "تسجيل الخروج"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 shrink-0 sticky top-0 h-screen z-30 shadow-sm">
        <div className="w-full">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute right-0 top-0 h-full w-64 shadow-2xl">
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between gap-4 px-6 py-4">

            {/* Left: Mobile menu + Breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <Menu size={18} />
              </button>
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                <span className="font-medium text-gray-900">الإدارة</span>
              </div>
            </div>

            {/* Right: Search + Notifications + User */}
            <div className="flex items-center gap-3">

              {/* Search */}
              <div className="relative hidden md:block">
                <Search
                  size={15}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  placeholder="بحث..."
                  className="h-9 w-56 bg-gray-50 border border-gray-200 rounded-lg pr-9 pl-4 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-orange-400 focus:bg-white transition"
                />
              </div>

              {/* Notifications */}
              <button
                onClick={() => setNotifDrawerOpen(true)}
                className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-orange-500 transition-colors"
              >
                <Bell size={17} />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full bg-orange-500 text-white text-[9px] font-bold border-2 border-white">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </button>

              {/* Divider */}
              <div className="w-px h-6 bg-gray-200 hidden md:block" />

              {/* User Avatar */}
              <div className="hidden md:flex items-center gap-2 cursor-pointer group">
                <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
                  {adminName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-none">
                    {adminName}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">مسؤول</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>

      <AdminMobileNav />

      <NotificationsDrawer
        isOpen={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
        onUnreadCountChange={setNotifCount}
      />
    </div>
  );
}
