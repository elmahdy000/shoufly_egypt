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
    <header className="sticky top-0 z-50 border-b-2 border-border/50 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10 dir-rtl">
        <div className="flex items-center gap-4 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 transition-transform group-hover:rotate-12">
            <Zap size={22} strokeWidth={2.5} />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-black leading-none text-slate-900 sm:text-xl tracking-tight">{title}</h1>
            {subtitle && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{subtitle}</p>}
          </div>
        </div>

        <nav className="hidden xl:flex items-center gap-1.5 rounded-[20px] bg-muted/30 p-1.5 border border-border/40 backdrop-blur-sm">
          {navConfig.items.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2.5 rounded-xl px-5 py-2.5 text-xs font-black transition-all ${
                  active
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                    : "text-slate-500 hover:bg-white hover:shadow-sm hover:text-slate-900"
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2.5">
            <Link
              href="/messages"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-white text-slate-400 transition-all hover:border-primary hover:text-primary hover:shadow-lg hover:shadow-primary/5 active:scale-90"
              title="الرسائل"
            >
              <MessageSquare size={18} />
            </Link>

            <NotificationDropdown />
          </div>

          <Link
            href={navConfig.profileHref}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border-2 transition-all active:scale-90 ${
              isActivePath(pathname, navConfig.profileHref)
                ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                : "border-border bg-white text-slate-400 hover:border-primary hover:text-primary"
            }`}
            title="الملف الشخصي"
          >
            <User size={18} />
          </Link>

          <button
            onClick={handleLogout}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-500 transition-all hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-100 active:scale-90"
            title="تسجيل الخروج"
          >
            <LogOut size={18} />
          </button>

          {actions}
        </div>
      </div>

      {/* Mobile Sub-Nav: High Fidelity Glass */}
      <div className="xl:hidden border-t border-border/30 bg-white/40 px-4 py-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {navConfig.items.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-[11px] font-black transition-all ${
                  active
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                    : "bg-white border border-border/60 text-slate-500"
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
