"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Search,
  Plus,
  MessageSquare,
  User,
  Truck,
  BarChart3,
  Package,
} from "lucide-react";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  role: string;
}

const navItems: { [key: string]: NavItem[] } = {
  client: [
    { icon: Home, label: "الرئيسية", href: "/client", role: "client" },
    { icon: Search, label: "استكشاف", href: "/client/requests", role: "client" },
    { icon: Plus, label: "طلب جديد", href: "/client/requests/new", role: "client" },
    { icon: MessageSquare, label: "الرسائل", href: "/client/chat", role: "client" },
    { icon: User, label: "ملفي", href: "/client/profile", role: "client" },
  ],
  vendor: [
    { icon: Home, label: "الرئيسية", href: "/vendor", role: "vendor" },
    { icon: Search, label: "الطلبات", href: "/vendor/requests", role: "vendor" },
    { icon: MessageSquare, label: "الرسائل", href: "/vendor/chat", role: "vendor" },
    { icon: BarChart3, label: "الإحصائيات", href: "/vendor/earnings", role: "vendor" },
    { icon: User, label: "ملفي", href: "/vendor/profile", role: "vendor" },
  ],
  delivery: [
    { icon: Home, label: "الرئيسية", href: "/delivery", role: "delivery" },
    { icon: Truck, label: "المشاوير", href: "/delivery/tasks", role: "delivery" },
    { icon: MessageSquare, label: "الرسائل", href: "/delivery/chat", role: "delivery" },
    { icon: BarChart3, label: "أرباحي", href: "/delivery/earnings", role: "delivery" },
    { icon: User, label: "ملفي", href: "/delivery/profile", role: "delivery" },
  ],
};

export function BottomNavigation() {
  const pathname = usePathname();
  
  // Determine which role based on pathname
  let role = "client";
  if (pathname.startsWith("/vendor")) role = "vendor";
  else if (pathname.startsWith("/delivery")) role = "delivery";
  else if (pathname.startsWith("/admin")) return null;

  const items = navItems[role] || navItems.client;

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
      dir="rtl"
    >
      {/* Gradient background with blur */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-white/90 backdrop-blur-2xl border-t border-gray-200/50" />

      {/* Main container */}
      <div className="relative max-w-2xl mx-auto px-2 py-3 flex items-center justify-between gap-0.5 h-20">
        <AnimatePresence>
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="relative h-full flex flex-col items-center justify-center group"
                >
                  {/* Active background */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavBg"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute inset-x-1 top-0.5 bottom-0 bg-gradient-to-b from-orange-100 via-orange-50 to-transparent rounded-2xl -z-10"
                    />
                  )}

                  {/* Icon */}
                  <motion.div
                    animate={{
                      scale: isActive ? 1.15 : 1,
                      y: isActive ? -2 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                    className={`p-2 rounded-xl transition-all duration-300 relative z-10 ${
                      isActive
                        ? "text-orange-600 drop-shadow-lg"
                        : "text-gray-500 group-hover:text-gray-700"
                    }`}
                  >
                    <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                    
                    {/* Glow effect */}
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0.4 }}
                        animate={{ scale: 1.3, opacity: 0 }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute inset-0 bg-orange-500/30 rounded-xl blur-md -z-10"
                      />
                    )}
                  </motion.div>

                  {/* Label */}
                  <motion.span
                    animate={{
                      scale: isActive ? 1.05 : 1,
                      fontWeight: isActive ? 700 : 600,
                    }}
                    transition={{ duration: 0.2 }}
                    className={`text-[9px] tracking-tight mt-0.5 transition-all duration-300 ${
                      isActive
                        ? "text-orange-600 font-bold"
                        : "text-gray-600 opacity-75"
                    }`}
                  >
                    {item.label}
                  </motion.span>

                  {/* Active dot */}
                  {isActive && (
                    <motion.div
                      layoutId="navIndicator"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute bottom-1 w-1 h-1 bg-orange-600 rounded-full"
                    />
                  )}

                  {/* Tap ripple */}
                  <motion.div
                    whileTap={{ scale: 2.5, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 rounded-xl bg-orange-400/25 pointer-events-none"
                  />
                </motion.div>
              </Link>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
