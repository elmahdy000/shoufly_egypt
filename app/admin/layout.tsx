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
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: keyof AdminStats;
};

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "العمليات المركزية",
    items: [
      { label: "لوحة التحكم", icon: LayoutGrid, href: "/admin" },
      { label: "إدارة الطلبات", icon: Package, href: "/admin/requests", badge: "openRequests" },
      { label: "تتبع الأسطول", icon: Truck, href: "/admin/tracking" },
      { label: "تحليل البيانات", icon: BarChart3, href: "/admin/analytics" },
    ],
  },
  {
    label: "إدارة النظام",
    items: [
      { label: "سجل المستخدمين", icon: Users, href: "/admin/users" },
      { label: "إدارة الموردين", icon: Briefcase, href: "/admin/vendors", badge: "totalVendors" },
    ],
  },
  {
    label: "القطاع المالي",
    items: [
      { label: "قيود العمليات", icon: BarChart3, href: "/admin/finance" },
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
    listAllNotifications("ADMIN").then((list) => setNotifCount(list.filter((i) => !i.isRead).length)).catch(() => {});
    apiFetch<{ fullName?: string }>("/api/auth/me", "ADMIN").then((u) => u?.fullName && setAdminName(u.fullName)).catch(() => {});
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } finally { setIsLoggingOut(false); }
  };

  const getBadge = (key?: keyof AdminStats) => (key && stats ? stats[key] ?? 0 : 0);

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white border-l border-slate-200 relative overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-8 border-b border-slate-100 relative z-10">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white shadow-sm">
          <Shield size={20} />
        </div>
        <div>
          <p className="text-xl font-bold tracking-tight leading-none text-slate-900 font-jakarta uppercase">Shoofly<span className="text-orange-600 italic text-[10px] ml-1">Admin</span></p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Management Portal v3.4</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-8 custom-scrollbar relative z-10">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-2">
            <p className="text-[10px] font-bold text-slate-400 px-4 uppercase tracking-wider">{group.label}</p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                const badge = getBadge(item.badge);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-orange-50 text-orange-700 shadow-sm"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-orange-600" : "text-slate-400 group-hover:text-slate-600 transition-all"} />
                    <span className="flex-1 text-[13px]">{item.label}</span>
                    {badge > 0 && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isActive ? 'bg-orange-200 text-orange-800' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
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

      <div className="p-4 border-t border-slate-100 space-y-4 relative z-10">
        <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3 border border-slate-100">
           <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">{adminName.charAt(0)}</div>
           <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate leading-none">{adminName}</p>
              <p className="text-[9px] font-medium text-slate-400 truncate mt-1 uppercase tracking-tight">Super Administrator</p>
           </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 text-[11px] font-bold text-slate-500 transition-all hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 active:scale-95 disabled:opacity-60"
        >
          {isLoggingOut ? <LoaderCircle size={14} className="animate-spin" /> : <LogOut size={14} />}
          {isLoggingOut ? "جاري الخروج..." : "تسجيل الخروج"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-tajawal flex" dir="rtl">
      <aside className="hidden lg:flex lg:w-72 shrink-0 sticky top-0 h-screen z-50 border-l border-slate-200 shadow-sm">
         <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]" onClick={() => setSidebarOpen(false)} />
          <motion.aside initial={{ x: 300 }} animate={{ x: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="absolute right-0 top-0 h-full w-72 max-w-[85vw] bg-white shadow-2xl">
            <SidebarContent />
          </motion.aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
           <div className="px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between gap-6">
                 <div className="flex items-center gap-4">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-slate-200 shadow-sm active:scale-95 transition-all">
                       <Menu size={20} className="text-slate-600" />
                    </button>
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                       <Shield className="text-orange-600" size={14} />
                       <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">Security Center <span className="text-green-600 ml-1">Live</span></span>
                    </div>
                 </div>

                 <div className="flex items-center gap-3">
                    <div className="relative group hidden lg:block">
                       <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-all" size={14} />
                       <input placeholder="البحث..." className="h-10 w-64 bg-slate-50 border border-slate-200 px-10 rounded-lg text-xs font-medium focus:bg-white focus:border-orange-500 outline-none transition-all placeholder:text-slate-400" />
                    </div>

                    <button
                      onClick={() => setNotifDrawerOpen(true)}
                      className="relative w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:border-orange-500 hover:text-orange-600 transition-all group active:scale-95"
                    >
                       <Bell size={18} />
                       {notifCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 border-2 border-white shadow-sm flex items-center justify-center text-[8px] font-bold text-white">{notifCount}</span>}
                    </button>

                    <div className="h-4 w-px bg-slate-200 mx-1 hidden md:block" />

                    <div className="hidden md:flex items-center gap-3 pr-1 group cursor-pointer">
                       <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold transition-all border border-slate-200">
                          {adminName.slice(0,1)}
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </header>

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
