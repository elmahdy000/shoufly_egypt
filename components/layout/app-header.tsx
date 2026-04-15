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
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10 dir-rtl">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
            <Zap size={20} strokeWidth={2.5} />
          </div>
          <div className="space-y-1">
            <h1 className="text-lg font-black leading-none text-slate-900 sm:text-xl">{title}</h1>
            {subtitle && <p className="text-[11px] font-bold text-slate-500">{subtitle}</p>}
          </div>
        </div>

        <nav className="hidden xl:flex items-center gap-1 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
          {navConfig.items.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition-all ${
                  active
                    ? "bg-primary text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/messages"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-primary hover:text-primary"
            title="الرسائل"
            aria-label="الرسائل"
          >
            <MessageSquare size={18} />
          </Link>

          <NotificationDropdown />

          <Link
            href={navConfig.profileHref}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
              isActivePath(pathname, navConfig.profileHref)
                ? "border-primary bg-primary text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary"
            }`}
            title="الملف الشخصي"
            aria-label="الملف الشخصي"
          >
            <User size={18} />
          </Link>

          <button
            onClick={handleLogout}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition-all hover:bg-rose-600 hover:text-white"
            title="تسجيل الخروج"
            aria-label="تسجيل الخروج"
          >
            <LogOut size={17} />
          </button>

          {actions}
        </div>
      </div>

      <div className="xl:hidden border-t border-slate-100 bg-white/80 px-4 py-2 sm:px-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {navConfig.items.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  active
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Icon size={14} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
