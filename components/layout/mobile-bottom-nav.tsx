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
      className="fixed inset-x-2 bottom-2 z-[1000] rounded-[28px] border border-white/70 bg-white/92 backdrop-blur-xl shadow-[0_-10px_35px_-18px_rgba(15,23,42,0.45)] md:hidden"
      style={{ 
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 10px)'
      }}
    >
      <div className="mx-auto flex h-[64px] max-w-lg items-stretch justify-between px-2 pt-1">
        {items.map((item) => {
          const active = isPathActive(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex-1 min-w-0 flex flex-col items-center justify-center gap-1 rounded-2xl group transition-all duration-300"
              aria-current={active ? "page" : undefined}
            >
              {/* Active Glow Strip at Top */}
              {active && (
                <motion.div 
                  layoutId="glow-strip"
                  className="absolute -top-0.5 h-1 w-8 rounded-full bg-primary shadow-[0_2px_8px_rgba(255,90,0,0.4)] z-20"
                />
              )}
              
              {/* Icon with Active Scale */}
              <div className={`transition-all duration-300 ${active ? "text-primary scale-105 -translate-y-0.5" : "text-slate-400 group-hover:text-slate-600"}`}>
                {Icon && React.createElement(Icon, { 
                  size: 20, 
                  strokeWidth: active ? 2.5 : 1.8 
                })}
              </div>
              
              <span className={`text-[10px] font-cairo leading-none tracking-wide transition-all duration-300 ${
                active ? "text-primary font-semibold scale-105" : "text-slate-500 font-medium opacity-70"
              }`}>
                {item.label}
              </span>

              {/* Click Surface Effect */}
              <div className="absolute inset-0 rounded-2xl group-active:bg-slate-100/50 transition-colors pointer-events-none" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
