"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FiHome, 
  FiPackage, 
  FiTrendingUp, 
  FiDollarSign, 
  FiUsers, 
  FiSettings,
  FiRepeat,
  FiInbox,
  FiMoon,
  FiSun
} from "react-icons/fi";
import { useTheme } from "@/components/providers/theme-provider";

export type SidebarItem = { href: string; label: string; icon: any };

export function Sidebar({ title, items }: { title: string; items: SidebarItem[] }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="hidden h-screen w-64 shrink-0 border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 lg:flex flex-col">
      {/* Brand Header */}
      <div className="px-6 py-6 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
          <FiHome size={20} />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Shoofly</p>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h2>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = item.href === '/admin' ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive 
                  ? 'bg-primary text-white font-medium' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-primary transition-colors'} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm">
               AD
             </div>
             <div>
               <p className="text-sm font-bold text-slate-900 dark:text-slate-100">المدير العام</p>
               <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> متصل
               </p>
             </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="تبديل الوضع"
            >
              {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
            </button>
            <button 
              onClick={() => {
                document.cookie = 'session_token=; Max-Age=0; path=/';
                window.location.href = '/login';
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              title="تسجيل الخروج"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
