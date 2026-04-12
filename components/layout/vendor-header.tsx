"use client";

import Link from "next/link";
import { FiMessageSquare, FiBell } from "react-icons/fi";

interface VendorHeaderProps {
  unreadMessages?: number;
  unreadNotifications?: number;
}

export function VendorHeader({ 
  unreadMessages = 3, 
  unreadNotifications = 2 
}: VendorHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-8 dir-rtl">
        {/* Right Side - Title */}
        <div>
          <h1 className="text-xl font-bold text-[#0F1111]">تطبيق المورد</h1>
        </div>

        {/* Left Side - Icons */}
        <div className="flex items-center gap-3">
          {/* Messages */}
          <Link 
            href="/messages" 
            className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-all relative"
          >
            <FiMessageSquare size={20} />
            {unreadMessages > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                {unreadMessages > 9 ? '9+' : unreadMessages}
              </span>
            )}
          </Link>

          {/* Notifications */}
          <Link
            href="/notifications"
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/90 transition-all relative"
          >
            <FiBell size={20} />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-primary rounded-full text-[9px] font-bold flex items-center justify-center border border-primary">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
