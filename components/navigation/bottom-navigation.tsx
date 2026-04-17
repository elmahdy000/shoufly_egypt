"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0px)' }}
      dir="rtl"
    >
      {/* Main container */}
      <div className="max-w-2xl mx-auto px-0 flex items-center justify-between h-16">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 h-full flex flex-col items-center justify-center relative"
            >
              {/* Active indicator line at top */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-black" />
              )}

              {/* Icon */}
              <div className={`transition-colors duration-200 ${
                isActive
                  ? "text-black"
                  : "text-gray-400"
              }`}>
                <Icon size={24} strokeWidth={isActive ? 2 : 1.5} />
              </div>

              {/* Label */}
              <span className={`text-[9px] font-medium mt-1 transition-colors duration-200 ${
                isActive
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
