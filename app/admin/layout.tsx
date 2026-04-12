"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  FiLayout, FiPackage, FiUsers, FiDollarSign, 
  FiSettings, FiLogOut, FiMenu, FiBell, FiShield,
  FiZap, FiCreditCard, FiAlertTriangle, FiLoader
} from 'react-icons/fi';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [adminName, setAdminName] = useState('مدير النظام');
  const [notificationCount, setNotificationCount] = useState(0);
  // TODO: Fetch actual notification count from API on mount

  useEffect(() => {
    // جلب بيانات الأدمن من localStorage أو API
    const storedName = localStorage.getItem('adminName');
    if (storedName) setAdminName(storedName);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('adminName');
      localStorage.removeItem('token');
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    { label: 'الرئيسية', icon: <FiLayout />, href: '/admin' },
    { label: 'الطلبات', icon: <FiPackage />, href: '/admin/requests' },
    { label: 'المستخدمين', icon: <FiUsers />, href: '/admin/users' },
    { label: 'المالية', icon: <FiDollarSign />, href: '/admin/finance' },
    { label: 'السحوبات', icon: <FiCreditCard />, href: '/admin/withdrawals' },
    { label: 'النزاعات', icon: <FiAlertTriangle />, href: '/admin/refunds' },
    { label: 'الإعدادات', icon: <FiSettings />, href: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans dir-rtl text-slate-800" dir="rtl">
      {/* 🖥 Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col bg-white border-l border-slate-200 sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex items-center justify-start gap-4">
           <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
             <FiShield size={22} />
           </div>
           <div>
             <span className="text-lg font-bold text-slate-900 tracking-tight block leading-none">شوفلاي</span>
             <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-1 block">Admin Portal</span>
           </div>
        </div>

        <div className="px-4 py-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">القائمة الرئيسية</p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive 
                      ? "bg-slate-900 text-white shadow-sm" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium"
                  }`}
                >
                  <span className={`text-[1.2rem] ${isActive ? "text-white" : "text-slate-400"}`}>
                    {item.icon}
                  </span>
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 mt-auto">
           <button 
             onClick={handleLogout}
             disabled={isLoggingOut}
             className="flex items-center justify-center gap-2 px-4 py-2.5 w-full rounded-lg font-medium text-slate-600 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 transition-colors disabled:opacity-50"
           >
             {isLoggingOut ? <FiLoader size={16} className="animate-spin" /> : <FiLogOut size={16} />}
             <span className="text-sm">{isLoggingOut ? 'جاري الخروج...' : 'تسجيل الخروج'}</span>
           </button>
        </div>
      </aside>

      {/* 📱 Mobile Context */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-50">
           <div className="flex items-center gap-4">
              <button className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md"><FiMenu size={20} /></button>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-md border border-emerald-100 text-[11px] font-bold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                مراقبة النظام حية
              </div>
           </div>

           <div className="flex items-center gap-5">
              <button 
                className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                onClick={() => router.push('/admin/notifications')}
              >
                <FiBell size={20} />
                {notificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                )}
              </button>
              
              <div className="flex items-center gap-3 pl-2 sm:pl-0 border-r border-slate-200 pr-5">
                 <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-900 leading-none">{adminName}</p>
                    <p className="text-[11px] text-slate-500 mt-1">Super Admin</p>
                 </div>
                 <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=f1f5f9&color=0f172a`} alt="Admin" />
                 </div>
              </div>
           </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
