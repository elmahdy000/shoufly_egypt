"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
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
      className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-2xl safe-area-inset-bottom"
      dir="rtl"
    >
      <div className="max-w-2xl mx-auto px-2 py-3 flex items-center justify-between gap-1">
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
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl transition-all ${
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-[10px] font-bold">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="h-1 w-6 bg-primary rounded-full mt-0.5"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
