"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    <motion.nav 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-[1000] md:hidden"
      style={{ 
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)',
      }}
      dir="rtl"
    >
      {/* Background with blur */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-white/90 backdrop-blur-2xl border-t border-gray-200/50" />

      {/* Main Container */}
      <div className="relative mx-auto flex items-center justify-around h-20 px-2 max-w-lg">
        <AnimatePresence>
          {items.map((item, index) => {
            const active = isPathActive(item.href);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex-1 flex flex-col items-center justify-center h-full group transition-all duration-300"
              >
                {/* Active background bubble */}
                {active && (
                  <motion.div 
                    layoutId="active-bg"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute inset-x-2 top-1 bottom-0 bg-gradient-to-b from-orange-100 via-orange-50 to-transparent rounded-2xl -z-10"
                  />
                )}

                {/* Icon with animations */}
                <motion.div 
                  whileTap={{ scale: 0.85 }}
                  className={`transition-all duration-300 p-2 rounded-xl relative z-10 ${
                    active 
                      ? "text-orange-600 scale-110 drop-shadow-lg" 
                      : "text-gray-500 group-hover:text-gray-700"
                  }`}
                >
                  <Icon size={22} strokeWidth={active ? 2.2 : 1.8} />
                  
                  {/* Glow effect for active */}
                  {active && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{ scale: 1.2, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 bg-orange-500/30 rounded-xl blur-md -z-10"
                    />
                  )}
                </motion.div>
                
                {/* Label */}
                <motion.span 
                  animate={{
                    scale: active ? 1.05 : 1,
                    fontWeight: active ? 700 : 600,
                  }}
                  transition={{ duration: 0.2 }}
                  className={`text-[10px] tracking-tight mt-1 transition-all duration-300 ${
                    active 
                      ? "text-orange-600 font-bold" 
                      : "text-gray-600 opacity-80"
                  }`}
                >
                  {item.label}
                </motion.span>

                {/* Active indicator dot */}
                {active && (
                  <motion.div 
                    layoutId="indicator-dot"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute bottom-0.5 w-1 h-1 bg-orange-600 rounded-full"
                  />
                )}

                {/* Ripple effect on tap */}
                <motion.div 
                  whileTap={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 rounded-xl bg-orange-400/20 pointer-events-none"
                />
              </Link>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
