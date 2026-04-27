"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Briefcase,
  CreditCard,
  LayoutGrid,
  LoaderCircle,
  LogOut,
  Menu,
  Package,
  Search,
  Shield,
  Truck,
  Users,
  BarChart3,
  Settings,
  Eye,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { listAllNotifications } from "@/lib/api/notifications";
import { NotificationsDrawer } from "@/components/admin/notifications-drawer";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: keyof AdminStats;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "العمليات المركزية",
    items: [
      { label: "لوحة التحكم", icon: LayoutGrid, href: "/admin" },
      { label: "إدارة الطلبات", icon: Package, href: "/admin/requests", badge: "openRequests" },
      { label: "مركز الرؤية", icon: Eye, href: "/admin/vision", badge: "pendingAiReview" },
      { label: "تتبع الأسطول", icon: Truck, href: "/admin/tracking" },
      { label: "التحليلات", icon: BarChart3, href: "/admin/analytics" },
    ],
  },
  {
    label: "إدارة النظام",
    items: [
      { label: "سجل المستخدمين", icon: Users, href: "/admin/users" },
      { label: "إدارة الموردين", icon: Briefcase, href: "/admin/vendors", badge: "totalVendors" },
      { label: "العروض", icon: Sparkles, href: "/admin/bids" },
    ],
  },
  {
    label: "القطاع المالي",
    items: [
      { label: "المالية", icon: BarChart3, href: "/admin/finance" },
      { label: "طلبات السحب", icon: CreditCard, href: "/admin/withdrawals", badge: "pendingWithdrawals" },
      { label: "الاستردادات", icon: Settings, href: "/admin/refunds" },
    ],
  },
];

interface AdminStats {
  totalUsers: number;
  openRequests: number;
  pendingWithdrawals: number;
  totalVendors: number;
  pendingAiReview: number;
  onlineAdmins: number;
}

export default function AdminDashboardShell({ children }: { children: React.ReactNode }) {
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
    // 💓 Presence Heartbeat
    const sendHeartbeat = () => {
      apiFetch("/api/admin/heartbeat", "ADMIN", { method: "POST" }).catch(() => {});
    };
    
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 45000); // Every 45s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    apiFetch<AdminStats>("/api/admin/stats", "ADMIN").then(setStats).catch(() => { });
    listAllNotifications("ADMIN")
      .then((list) => setNotifCount(list.filter((item) => !item.isRead).length))
      .catch(() => { });
    apiFetch<{ fullName?: string }>("/api/auth/me", "ADMIN")
      .then((u) => u?.fullName && setAdminName(u.fullName))
      .catch(() => { });
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiFetch("/api/auth/logout", "ADMIN", { method: "POST" });
      router.push("/login");
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getBadge = (key?: keyof AdminStats) => (key && stats ? stats[key] ?? 0 : 0);

  const SidebarContent = () => (
    <div className="flex h-full flex-col overflow-hidden bg-white/70 backdrop-blur-xl border-l border-slate-100/50 shadow-[4px_0_24px_-10px_rgba(0,0,0,0.03)] relative">
      {/* Decorative Gradient Overlay */}
      <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      <div className="px-8 py-10 relative z-10">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-slate-900 text-white shadow-lg shadow-slate-900/20 group-hover:scale-105 transition-transform">
            <Shield size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none mb-1">شوفلي</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">نظام الإدارة</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-8 overflow-y-auto px-6 py-2 no-scrollbar relative z-10">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-3">
            <p className="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400/80">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                const badge = getBadge(item.badge);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 group relative ${isActive
                        ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10 font-bold"
                        : "text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-900"
                      }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute right-0 w-1.5 h-6 bg-primary rounded-l-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <Icon size={20} className={isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-900 transition-colors"} />
                    <span className="flex-1 text-[13px] tracking-tight">{item.label}</span>
                    {badge > 0 && (
                      <span
                        className={`rounded-xl px-2 py-0.5 text-[10px] font-black shadow-sm ${isActive ? "bg-primary text-white" : "bg-primary/10 text-primary border border-primary/10"
                          }`}
                      >
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

      <div className="p-6 border-t border-slate-100/50 relative z-10 bg-white/40 backdrop-blur-md">
        <div className="bg-slate-50 rounded-3xl p-4 mb-4 border border-slate-100/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] bg-white border border-slate-200 shadow-sm text-slate-600 text-xs font-black">
              {adminName.charAt(0) || "م"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-900">{adminName}</p>
              <p className="truncate text-[10px] font-bold uppercase tracking-wider text-primary">
                حساب المسؤول
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-black uppercase tracking-widest text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600 active:scale-95 disabled:opacity-60"
        >
          {isLoggingOut ? <LoaderCircle size={16} className="animate-spin" /> : <LogOut size={16} />}
          {isLoggingOut ? "جارٍ الخروج..." : "تسجيل الخروج"}
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="flex min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(255,106,0,0.06),transparent_32%),linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] font-cairo text-foreground"
      dir="rtl"
    >
      <aside className="hidden h-screen w-72 shrink-0 lg:sticky lg:top-0 lg:flex">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.button
              aria-label="إغلاق القائمة"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: 280 }}
              animate={{ x: 0 }}
              exit={{ x: 280 }}
              transition={{ type: "spring", damping: 24, stiffness: 220 }}
              className="absolute right-2 top-2 bottom-2 w-[min(88vw,20rem)] overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.5)]"
            >
              <SidebarContent />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 h-16 border-b border-slate-200 bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_-20px_rgba(15,23,42,0.15)]">
          <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 lg:hidden"
              >
                <Menu size={20} />
              </button>
              <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 sm:flex">
                <Shield className="text-primary" size={14} />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Security Center
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative hidden w-64 xl:block">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  placeholder="البحث..."
                  className="admin-input h-9 pr-9 pl-4"
                />
              </div>

              <button
                onClick={() => setNotifDrawerOpen(true)}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-orange-200 hover:text-primary-hover"
              >
                <Bell size={18} />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-primary px-1 text-[8px] font-bold text-white">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </button>

              <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 md:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-xs font-bold text-white">
                  {adminName.charAt(0) || "م"}
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs font-semibold text-slate-900">{adminName}</p>
                  <p className="text-[10px] text-slate-400">Admin</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>

      <NotificationsDrawer
        isOpen={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
        onUnreadCountChange={setNotifCount}
      />
    </div>
  );
}
