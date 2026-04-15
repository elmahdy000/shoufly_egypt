"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import { listAllNotifications } from "@/lib/api/notifications";
import { NotificationsDrawer } from "@/components/admin/notifications-drawer";
import { AdminMobileNav } from "@/components/navigation/admin-mobile-nav";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Briefcase,
  CreditCard,
  LayoutGrid,
  LoaderCircle,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Search,
  Settings,
  Shield,
  Truck,
  Users,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: keyof AdminStats;
};

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "عام",
    items: [
      { label: "لوحة التحكم", icon: LayoutGrid, href: "/admin" },
      { label: "الطلبات", icon: Package, href: "/admin/requests", badge: "openRequests" },
      { label: "التتبع المباشر", icon: Truck, href: "/admin/tracking" },
      { label: "التحليلات", icon: BarChart3, href: "/admin/analytics" },
      { label: "العروض", icon: Briefcase, href: "/admin/bids" },
    ],
  },
  {
    label: "إدارة المستخدمين",
    items: [
      { label: "المستخدمون", icon: Users, href: "/admin/users" },
      { label: "التجار", icon: Briefcase, href: "/admin/vendors", badge: "totalVendors" },
    ],
  },
  {
    label: "المالية",
    items: [
      { label: "المعاملات", icon: BarChart3, href: "/admin/finance" },
      { label: "السحوبات", icon: CreditCard, href: "/admin/withdrawals", badge: "pendingWithdrawals" },
      { label: "الاسترداد", icon: AlertTriangle, href: "/admin/refunds" },
    ],
  },
  {
    label: "النظام",
    items: [{ label: "الإعدادات", icon: Settings, href: "/admin/settings" }],
  },
];

const HEADER_QUICK_ITEMS: NavItem[] = [
  { label: "الرئيسية", icon: LayoutGrid, href: "/admin" },
  { label: "الطلبات", icon: Package, href: "/admin/requests", badge: "openRequests" },
  { label: "التجار", icon: Briefcase, href: "/admin/vendors", badge: "totalVendors" },
  { label: "المالية", icon: CreditCard, href: "/admin/finance", badge: "pendingWithdrawals" },
  { label: "التحليلات", icon: BarChart3, href: "/admin/analytics" },
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

  const handleUnreadCountChange = useCallback((count: number) => {
    setNotifCount(count);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    apiFetch<AdminStats>("/api/admin/stats", "ADMIN")
      .then((data) => setStats(data))
      .catch(() => {});

    listAllNotifications("ADMIN")
      .then((list) => setNotifCount(list.filter((item) => !item.isRead).length))
      .catch(() => {});

    apiFetch<{ fullName?: string }>("/api/auth/me", "ADMIN")
      .then((user) => {
        if (user?.fullName) setAdminName(user.fullName);
      })
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

  const getBadge = (key?: keyof AdminStats) => {
    if (!key || !stats) return 0;
    return stats[key] ?? 0;
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white border-l border-[#E2E2E5]">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Shield size={18} />
        </div>
        <div>
          <p className="text-sm font-black text-slate-900 leading-none">شوفلي</p>
          <p className="text-xs text-slate-500 mt-1">لوحة الإدارة</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-7 custom-scrollbar">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-2">
            <p className="text-xs text-slate-400 px-3">{group.label}</p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                const badge = getBadge(item.badge);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                      isActive
                        ? "bg-orange-50 text-primary font-bold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute right-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-primary" />
                    )}
                    <Icon size={16} />
                    <span className="flex-1">{item.label}</span>
                    {badge > 0 && (
                      <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                        {badge > 99 ? "99+" : badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-3 border-t border-slate-100 p-4">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-sm font-bold text-slate-900 truncate">{adminName}</p>
          <p className="text-xs text-slate-500 mt-1">مدير النظام</p>
        </div>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
        >
          {isLoggingOut ? <LoaderCircle size={14} className="animate-spin" /> : <LogOut size={14} />}
          {isLoggingOut ? "جارٍ تسجيل الخروج..." : "تسجيل الخروج"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-tajawal flex" dir="rtl">
      <aside className="hidden lg:flex w-72 shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/35" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-80 max-w-[92vw] bg-white shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/95 backdrop-blur-md shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
          <div className="w-full px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100"
                  aria-label="فتح القائمة"
                >
                  <Menu size={20} />
                </button>

                <div className="hidden sm:flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">
                  <Shield size={16} className="text-primary" />
                  <div className="leading-none">
                    <p className="text-xs font-black text-slate-900">لوحة الإدارة</p>
                    <p className="text-[10px] font-bold text-slate-500 mt-1">Admin Control</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  className="hidden lg:inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-primary hover:text-primary transition-all"
                  aria-label="بحث"
                  title="بحث"
                >
                  <Search size={17} />
                </button>

                <Link
                  href="/messages"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-primary hover:text-primary transition-all"
                  aria-label="الرسائل"
                  title="الرسائل"
                >
                  <MessageSquare size={17} />
                </Link>

                <button
                  onClick={() => setNotifDrawerOpen(true)}
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-primary hover:text-primary transition-all"
                  aria-label="فتح الإشعارات"
                  title="الإشعارات"
                >
                  <Bell size={17} />
                  {notifCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary border border-white" />
                  )}
                </button>

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all disabled:opacity-60"
                  aria-label="تسجيل الخروج"
                  title="تسجيل الخروج"
                >
                  {isLoggingOut ? <LoaderCircle size={16} className="animate-spin" /> : <LogOut size={16} />}
                </button>

                <div className="hidden md:flex items-center gap-2 border-r border-slate-200 pr-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-black">
                    {adminName.slice(0, 1)}
                  </div>
                  <span className="text-sm font-bold text-slate-800 max-w-[150px] truncate">{adminName}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 hidden md:flex items-center justify-between gap-3">
              <nav className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1.5">
                {HEADER_QUICK_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                  const badge = getBadge(item.badge);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-black transition-all ${
                        isActive
                          ? "bg-primary text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Icon size={14} />
                      <span>{item.label}</span>
                      {badge > 0 && (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                            isActive ? "bg-white/25 text-white" : "bg-primary/10 text-primary"
                          }`}
                        >
                          {badge > 99 ? "99+" : badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="hidden lg:flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-emerald-700">النظام يعمل بشكل طبيعي</span>
              </div>
            </div>
          </div>
        </header>

        <main className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 pb-24 md:pb-10">
          {children}
        </main>
      </div>

      <AdminMobileNav />

      <NotificationsDrawer
        isOpen={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
        onUnreadCountChange={handleUnreadCountChange}
      />
    </div>
  );
}
