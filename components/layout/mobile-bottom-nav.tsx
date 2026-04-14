"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export type MobileNavItem = {
  href: string;
  label: string;
  icon?: React.ReactNode;
};

export function MobileBottomNav({ items }: { items: MobileNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 start-0 end-0 z-30 border-t border-slate-200 bg-white px-2 py-1 md:hidden">
      <ul className="mx-auto grid max-w-xl" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-1 py-2 transition-colors ${
                  isActive ? "text-primary" : "text-slate-400 hover:text-slate-700"
                }`}
              >
                {item.icon && (
                  <span className={`text-[19px] leading-none transition-transform ${isActive ? "scale-110" : ""}`}>
                    {item.icon}
                  </span>
                )}
                <span className={`text-[10px] leading-tight ${isActive ? "font-bold" : "font-medium"}`}>
                  {item.label}
                </span>
                {isActive && <span className="w-1 h-1 rounded-full bg-primary" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
