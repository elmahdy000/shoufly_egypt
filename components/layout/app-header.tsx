"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiMessageSquare, FiUser, FiArrowLeft, FiBell, FiZap, FiLogOut } from "react-icons/fi";
import { NotificationDropdown } from "@/components/shoofly/notification-dropdown";
import { logoutUser } from "@/lib/api/auth";

export function AppHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  const router = useRouter();

  async function handleLogout() {
    await logoutUser();
    router.push("/login");
  }
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="flex h-16 items-center justify-between gap-4 px-6 lg:px-8 dir-rtl">
        {/* Page Brand/Title */}
        <div className="text-right flex items-center gap-3">
           <div className="hidden lg:block">
             <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
             {subtitle ? <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p> : null}
           </div>
           {/* Mobile Title View */}
           <div className="lg:hidden">
             <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
           </div>
        </div>
        
        {/* Interactive Controls - Icons on far left for RTL */}
        <div className="flex items-center gap-4">
          {/* Activity Tools - Bell + Messages */}
          <div className="flex items-center gap-2">
             <NotificationDropdown />
             
             <Link 
              href="/messages" 
              className="w-9 h-9 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white hover:border-primary transition-all relative"
              title="المحادثات"
            >
              <FiMessageSquare size={18} />
              {/* TODO: Fetch unread message count from API */}
            </Link>
          </div>

          {/* User Profile - Leftmost */}
          <Link href="/profile" className="flex items-center gap-2 group flex-row-reverse">
             <div className="hidden md:block">
                <p className="text-xs text-slate-600 group-hover:text-primary transition-colors">حسابي</p>
             </div>
             <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-primary group-hover:text-white transition-all">
                <FiUser size={18} />
             </div>
          </Link>

          <div className="flex items-center gap-2">
            {actions}
            
            {/* Logout Button - Distinctive */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 h-9 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium rounded-lg hover:bg-rose-100 hover:border-rose-300 hover:text-rose-700 transition-all"
              title="تسجيل الخروج"
            >
              <FiLogOut size={14} />
              <span className="hidden sm:inline">خروج</span>
            </button>
            
            <Link
              href="/"
              className="hidden lg:flex items-center gap-1.5 px-4 h-9 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-all"
            >
              <FiZap size={14} /> الرئيسية
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
