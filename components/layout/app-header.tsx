"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardList,
  Home,
  LogOut,
  MessageSquare,
  Package,
  ShoppingBag,
  TrendingUp,
  User,
  Wallet,
  Zap,
} from "lucide-react";
import { NotificationDropdown } from "@/components/shoofly/notification-dropdown";
import { logoutUser } from "@/lib/api/auth";

type HeaderNavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

type RoleKey = "client" | "vendor" | "delivery" | "unknown";

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

const ROLE_NAV: Record<RoleKey, { items: HeaderNavItem[]; profileHref: string }> = {
  client: {
    profileHref: "/client/profile",
    items: [
      { href: "/client", label: "الرئيسية", icon: Home },
      { href: "/client/requests", label: "الطلبات", icon: Package },
      { href: "/client/wallet", label: "المحفظة", icon: Wallet },
    ],
  },
  vendor: {
    profileHref: "/vendor/profile",
    items: [
      { href: "/vendor", label: "الرئيسية", icon: Home },
      { href: "/vendor/requests", label: "الطلبات", icon: Package },
      { href: "/vendor/bids", label: "العروض", icon: ShoppingBag },
      { href: "/vendor/earnings", label: "الأرباح", icon: TrendingUp },
    ],
  },
  delivery: {
    profileHref: "/delivery/profile",
    items: [
      { href: "/delivery", label: "الرئيسية", icon: Home },
      { href: "/delivery/tasks", label: "المهام", icon: ClipboardList },
    ],
  },
  unknown: {
    profileHref: "/",
    items: [{ href: "/", label: "الرئيسية", icon: Home }],
  },
};

function detectRole(pathname: string): RoleKey {
  if (pathname.startsWith("/client")) return "client";
  if (pathname.startsWith("/vendor")) return "vendor";
  if (pathname.startsWith("/delivery")) return "delivery";
  return "unknown";
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/client" || href === "/vendor" || href === "/delivery") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppHeader({ title, subtitle, actions }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const role = detectRole(pathname);
  const navConfig = ROLE_NAV[role];

  async function handleLogout() {
    await logoutUser();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      {/* Main Header */}
      <div className="mx-auto flex h-16 sm:h-18 md:h-20 max-w-[1440px] items-center justify-between gap-2 sm:gap-3 md:gap-4 px-3 sm:px-4 md:px-6 lg:px-8 dir-rtl">
        {/* Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0">
          <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-lg sm:rounded-xl bg-primary text-white shadow-sm transition-transform hover:rotate-12">
            <Zap size={18} className="sm:hidden" strokeWidth={2.5} />
            <Zap size={20} className="hidden sm:block" strokeWidth={2.5} />
          </div>
          <div className="space-y-0.5 min-w-0">
            <h1 className="text-sm sm:text-base md:text-lg font-bold leading-tight text-gray-900 truncate">{title}</h1>
            {subtitle && <p className="text-[9px] sm:text-[10px] font-semibold text-gray-500 uppercase tracking-wide truncate">{subtitle}</p>}
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-1.5 rounded-lg bg-gray-50 p-1 border border-gray-200">
          {navConfig.items.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                  active
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-600 hover:bg-white hover:text-gray-900"
                }`}
              >
                <Icon size={14} strokeWidth={2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions & Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Messages - Hidden on small screens */}
          <Link
            href="/messages"
            className="hidden sm:inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl border border-gray-200 bg-white text-gray-400 transition-all hover:border-primary hover:text-primary hover:shadow-sm active:scale-90"
            title="الرسائل"
          >
            <MessageSquare size={16} className="sm:hidden" strokeWidth={2} />
            <MessageSquare size={18} className="hidden sm:block" strokeWidth={2} />
          </Link>

          {/* Notifications */}
          <div className="hidden sm:block">
            <NotificationDropdown />
          </div>

          {/* Profile Button */}
          <Link
            href={navConfig.profileHref}
            className={`inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl border-2 transition-all active:scale-90 ${
              isActivePath(pathname, navConfig.profileHref)
                ? "border-primary bg-primary text-white shadow-sm"
                : "border-gray-200 bg-white text-gray-400 hover:border-primary hover:text-primary"
            }`}
            title="الملف الشخصي"
          >
            <User size={16} className="sm:hidden" strokeWidth={2} />
            <User size={18} className="hidden sm:block" strokeWidth={2} />
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl border border-red-200 bg-red-50 text-red-500 transition-all hover:bg-red-500 hover:text-white hover:shadow-sm active:scale-90"
            title="تسجيل الخروج"
          >
            <LogOut size={16} className="sm:hidden" strokeWidth={2} />
            <LogOut size={18} className="hidden sm:block" strokeWidth={2} />
          </button>

          {actions}
        </div>
      </div>

      {/* Mobile Sub-Nav */}
      <div className="xl:hidden border-t border-gray-200 bg-white overflow-x-auto">
        <div className="mx-auto max-w-[1440px] px-3 sm:px-4 md:px-6 flex items-center gap-2 py-2">
          {navConfig.items.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap ${
                  active
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-white"
                }`}
              >
                <Icon size={14} strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
