"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export type MobileNavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
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
      className="fixed bottom-0 left-0 right-0 z-[1000] md:hidden bg-white border-t border-gray-200"
      style={{ 
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0px)',
      }}
      dir="rtl"
    >
      {/* Main Container */}
      <div className="relative mx-auto flex items-center justify-around h-16 max-w-lg px-0">
        {items.map((item) => {
          const active = isPathActive(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex-1 flex flex-col items-center justify-center h-full"
            >
              {/* Active indicator line at top */}
              {active && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-black" />
              )}

              {/* Icon */}
              <div className={`transition-colors duration-200 ${
                active 
                  ? "text-black" 
                  : "text-gray-400"
              }`}>
                <Icon size={24} strokeWidth={active ? 2 : 1.5} />
              </div>
              
              {/* Label */}
              <span className={`text-[9px] font-medium mt-1 transition-colors duration-200 ${
                active 
                  ? "text-black" 
                  : "text-gray-400"
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
