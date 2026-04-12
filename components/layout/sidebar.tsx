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
  FiInbox
} from "react-icons/fi";

export type SidebarItem = { href: string; label: string; icon: any };

export function Sidebar({ title, items }: { title: string; items: SidebarItem[] }) {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-72 shrink-0 border-l border-border bg-white lg:flex flex-col">
      {/* Brand Header */}
      <div className="px-8 py-10 flex flex-col gap-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Shoofly Platform</p>
        <h2 className="text-2xl font-extrabold text-foreground">{title}</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-5 mt-6 space-y-2 overflow-y-auto">
        {items.map((item) => {
          // Exact match for the root admin path vs subpaths
          const isActive = item.href === '/admin' ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 font-bold translate-x-1' 
                  : 'text-muted-foreground font-semibold hover:bg-slate-100/80 hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary transition-colors duration-300'} />
                <span className="text-sm tracking-wide">{item.label}</span>
              </div>
              
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile & Logout */}
      <div className="p-5 border-t border-border bg-slate-50/50 mt-auto">
        <div className="bg-white border border-border shadow-sm rounded-2xl p-4 flex items-center justify-between gap-3 group hover:border-rose-200 transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
               AD
             </div>
             <div>
               <p className="text-sm font-bold text-foreground">المدير العام</p>
               <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> متصل
               </p>
             </div>
          </div>
          
          {/* Logout Action (Simulated by reloading or navigating to login, middleware auto-clears if needed or we can call API) */}
          <button 
            onClick={() => {
              document.cookie = 'session_token=; Max-Age=0; path=/';
              window.location.href = '/login';
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            title="تسجيل الخروج"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
