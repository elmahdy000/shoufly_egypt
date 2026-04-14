"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api/client';
import { NotificationsDrawer } from '@/components/admin/notifications-drawer';
import { listAllNotifications } from '@/lib/api/notifications';
import { 
  FiGrid, FiPackage, FiUsers, FiSettings, 
  FiLogOut, FiBell, FiShield, FiCreditCard, FiAlertTriangle,
  FiBarChart2, FiChevronRight, FiX, FiMenu, FiTruck,
  FiLoader, FiBriefcase
} from 'react-icons/fi';

const NAV_GROUPS = [
  {
    label: 'عام',
    items: [
      { label: 'لوحة التحكم', icon: FiGrid, href: '/admin' },
      { label: 'الطلبات', icon: FiPackage, href: '/admin/requests', badge: 'openRequests' },
      { label: 'التتبع المباشر', icon: FiTruck, href: '/admin/tracking' },
      { label: 'التحليلات', icon: FiBarChart2, href: '/admin/analytics' },
    ]
  },
  {
    label: 'إدارة المستخدمين',
    items: [
      { label: 'المستخدمون', icon: FiUsers, href: '/admin/users' },
      { label: 'التجار', icon: FiBriefcase, href: '/admin/vendors', badge: 'totalVendors' },
    ]
  },
  {
    label: 'المالية',
    items: [
      { label: 'المعاملات', icon: FiBarChart2, href: '/admin/finance' },
      { label: 'السحوبات', icon: FiCreditCard, href: '/admin/withdrawals', badge: 'pendingWithdrawals' },
      { label: 'المطالبات', icon: FiAlertTriangle, href: '/admin/refunds' },
    ]
  },
  {
    label: 'النظام',
    items: [
      { label: 'الإعدادات', icon: FiSettings, href: '/admin/settings' },
    ]
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
  const [adminName, setAdminName] = useState('مدير النظام');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [notifCount, setNotifCount] = useState(0);

  const handleUnreadCountChange = useCallback((count: number) => {
    setNotifCount(count);
  }, []);

  useEffect(() => {
    apiFetch<AdminStats>('/api/admin/stats', 'ADMIN')
      .then(s => setStats(s))
      .catch(() => {});
    listAllNotifications('ADMIN')
      .then(n => setNotifCount(n.filter(x => !x.isRead).length))
      .catch(() => {});
    apiFetch<any>('/api/auth/me', 'ADMIN')
      .then(u => { if (u?.fullName) setAdminName(u.fullName); })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getBadge = (key?: string) => {
    if (!key || !stats) return 0;
    return (stats as any)[key] ?? 0;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
          <FiShield size={18} className="text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-base leading-none tracking-tight">شوفلي</p>
          <p className="text-slate-400 text-[10px] font-medium uppercase tracking-widest mt-0.5">Admin Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                const badge = getBadge(item.badge);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                      isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                        : 'text-slate-400 hover:bg-white/8 hover:text-white'
                    }`}
                  >
                    <item.icon size={17} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    {badge > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                        isActive ? 'bg-white/20 text-white' : 'bg-rose-500/20 text-rose-400'
                      }`}>{badge}</span>
                    )}
                    {isActive && <FiChevronRight size={14} className="text-white/60" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Admin Profile */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-3">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=f97316&color=fff&bold=true`}
            alt={adminName}
            className="w-9 h-9 rounded-lg shrink-0 border border-white/10"
          />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate leading-none">{adminName}</p>
            <p className="text-slate-500 text-[11px] mt-0.5">Super Admin</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all text-sm font-medium disabled:opacity-50"
        >
          {isLoggingOut ? <FiLoader size={15} className="animate-spin" /> : <FiLogOut size={15} />}
          {isLoggingOut ? 'جاري الخروج...' : 'تسجيل الخروج'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f6fa] flex font-sans" dir="rtl">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-slate-900 sticky top-0 h-screen overflow-hidden shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 bg-slate-900 h-full flex flex-col z-10 shadow-2xl">
            <button className="absolute top-4 left-4 text-slate-400 hover:text-white p-1" onClick={() => setSidebarOpen(false)}>
              <FiX size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-5 sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <FiMenu size={20} />
            </button>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-700">النظام يعمل</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setNotifDrawerOpen(true)}
              aria-label="الإشعارات"
            >
              <FiBell size={19} />
              {notifCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
              )}
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-r border-slate-200 pr-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-none">{adminName}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Super Admin</p>
              </div>
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=f97316&color=fff&bold=true`}
                alt={adminName}
                className="w-9 h-9 rounded-xl border border-slate-200 shrink-0"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-7">
          {children}
        </main>
      </div>

      <NotificationsDrawer
        isOpen={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
        onUnreadCountChange={handleUnreadCountChange}
      />
    </div>
  );
}
