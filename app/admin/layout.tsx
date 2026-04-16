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
    <div className="flex h-full flex-col bg-slate-950 text-white border-l-8 border-primary relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] -mr-40 -mt-40" />
      
      <div className="flex items-center gap-4 px-8 py-10 border-b border-white/5 relative z-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-slate-950 shadow-2xl rotate-3">
          <Shield size={24} />
        </div>
        <div>
          <p className="text-2xl font-black tracking-tight leading-none text-white font-jakarta uppercase">Shoofly<span className="text-primary italic text-xs ml-1">Admin</span></p>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-1">Version 3.4.0_Stable</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-6 py-10 space-y-12 custom-scrollbar relative z-10">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-4">
            <p className="text-[11px] font-black text-white/20 px-4 uppercase tracking-[0.4em]">{group.label}</p>
            <div className="space-y-2">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                const badge = getBadge(item.badge);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center gap-4 rounded-[1.5rem] px-5 py-4 text-sm font-black transition-all border-4 ${
                      isActive
                        ? "bg-primary text-slate-950 border-slate-950 shadow-[8px_8px_0px_#ffffff10] translate-x-2"
                        : "text-white/40 border-transparent hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon size={20} className={isActive ? "text-slate-950" : "text-white/20 group-hover:text-primary transition-all"} />
                    <span className="flex-1">{item.label}</span>
                    {badge > 0 && (
                      <span className={`rounded-xl px-2.5 py-0.5 text-[10px] font-black border-2 ${isActive ? 'bg-slate-950 text-white border-slate-950' : 'bg-primary text-slate-950 border-slate-950 shadow-lg'}`}>
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

      <div className="p-8 border-t border-white/5 space-y-6 relative z-10">
        <div className="p-5 bg-white/5 border-2 border-white/10 rounded-[2rem] flex items-center gap-4">
           <div className="w-10 h-10 rounded-xl bg-primary text-slate-950 flex items-center justify-center font-black text-sm">{adminName.charAt(0)}</div>
           <div className="min-w-0">
              <p className="text-sm font-black text-white truncate uppercase leading-none">{adminName}</p>
              <p className="text-[10px] font-black text-white/30 truncate mt-1">MASTER_ADMIN_ACCOUNT</p>
           </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-white/5 border-4 border-white/10 text-xs font-black text-white/40 transition-all hover:bg-rose-500 hover:text-white hover:border-slate-950 hover:shadow-xl active:scale-95 disabled:opacity-60"
        >
          {isLoggingOut ? <LoaderCircle size={18} className="animate-spin" /> : <LogOut size={18} />}
          {isLoggingOut ? "إغلاق النظام..." : "خروج آمن"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-tajawal flex" dir="rtl">
      <aside className="hidden lg:flex lg:w-80 shrink-0 sticky top-0 h-screen z-50 shadow-[40px_0px_100px_rgba(15,23,42,0.1)]">
         <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <motion.aside initial={{ x: 300 }} animate={{ x: 0 }} className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl">
            <SidebarContent />
          </motion.aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-40 bg-white border-b-4 border-slate-950 shadow-xl">
           <div className="px-6 lg:px-10 py-5">
              <div className="flex items-center justify-between gap-6">
                 <div className="flex items-center gap-4">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 border-2 border-slate-200 shadow-sm active:scale-95 transition-all">
                       <Menu size={24} />
                    </button>
                    <div className="hidden sm:flex items-center gap-3 px-6 py-3 bg-slate-950 text-white rounded-2xl border-2 border-slate-950 shadow-lg">
                       <Zap className="text-primary animate-pulse" size={18} />
                       <span className="text-[11px] font-black uppercase tracking-[0.2em] leading-none">Security Center <span className="text-primary ml-1">Live</span></span>
                    </div>
                 </div>

                 <div className="flex items-center gap-4">
                    <div className="relative group hidden lg:block">
                       <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-all" size={16} />
                       <input placeholder="البحث العميق في البيانات..." className="h-12 w-80 bg-slate-50 border-4 border-slate-100 px-12 rounded-2xl text-xs font-black focus:bg-white focus:border-slate-950 outline-none transition-all placeholder:text-slate-400" />
                    </div>

                    <button
                      onClick={() => setNotifDrawerOpen(true)}
                      className="relative w-12 h-12 flex items-center justify-center rounded-xl bg-white border-4 border-slate-200 text-slate-500 hover:border-primary hover:text-primary transition-all group shadow-sm active:scale-95"
                    >
                       <Bell size={22} className="group-hover:rotate-12 transition-all" />
                       {notifCount > 0 && <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-primary border-4 border-white shadow-sm flex items-center justify-center text-[9px] font-black text-slate-950">{notifCount}</span>}
                    </button>

                    <div className="h-10 w-1 bg-slate-200 mx-2 hidden md:block rounded-full" />

                    <div className="hidden md:flex items-center gap-4 pr-2 group cursor-pointer">
                       <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center text-sm font-black shadow-lg group-hover:scale-110 transition-all border-2 border-primary/20">
                          {adminName.slice(0,1)}
                       </div>
                       <div className="min-w-0">
                          <p className="text-sm font-black text-slate-900 leading-none truncate uppercase">{adminName}</p>
                          <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-tighter">Verified Identity</p>
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
