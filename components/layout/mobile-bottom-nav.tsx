"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { motion } from "framer-motion";

export type MobileNavItem = {
  href: string;
  label: string;
  icon: React.ElementType; // Using Lucide icon component type
};

export function MobileBottomNav({ items }: { items: MobileNavItem[] }) {
  const pathname = usePathname();

  const isPathActive = (href: string) => {
    if (href === "/client" || href === "/vendor" || href === "/delivery" || href === "/admin") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-[1000] bg-white/95 backdrop-blur-xl border-t border-slate-200/60 md:hidden rounded-t-2xl"
      style={{ 
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)', 
        boxShadow: '0 -8px 32px -8px rgba(0,0,0,0.12), 0 -2px 8px rgba(0,0,0,0.04)',
        marginLeft: '8px',
        marginRight: '8px',
        maxWidth: 'calc(100% - 16px)'
      }}
    >
      <div className="mx-auto flex max-w-lg items-center justify-around h-[60px] px-2">
        {items.map((item) => {
          const active = isPathActive(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex-1 flex flex-col items-center justify-center h-full group transition-all duration-300 min-w-[60px]"
            >
              {/* Active Glow Strip at Top */}
              {active && (
                <motion.div 
                  layoutId="glow-strip"
                  className="absolute -top-[1px] w-10 h-[2.5px] bg-primary rounded-b-full shadow-[0_2px_8px_rgba(255,90,0,0.4)] z-20"
                />
              )}
              
              {/* Icon with Active Scale */}
              <div className={`transition-all duration-300 ${active ? "text-primary scale-105 -translate-y-0.5" : "text-slate-400 group-hover:text-slate-600"}`}>
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
              </div>
              
              <span className={`text-[9px] font-cairo tracking-wide transition-all duration-300 mt-[2px] ${
                active ? "text-primary font-semibold scale-105" : "text-slate-500 font-medium opacity-70"
              }`}>
                {item.label}
              </span>

              {/* Click Surface Effect */}
              <div className="absolute inset-x-0 inset-y-1 rounded-xl group-active:bg-slate-100/50 transition-colors pointer-events-none" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
