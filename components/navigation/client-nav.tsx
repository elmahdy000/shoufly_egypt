"use client";

import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { Home, Package, Wallet, Bell, User } from "lucide-react";

const items = [
  { href: "/client",               label: "الرئيسية",  icon: Home },
  { href: "/client/requests",      label: "الطلبات",   icon: Package },
  { href: "/client/wallet",        label: "المحفظة",   icon: Wallet },
  { href: "/client/notifications", label: "الإشعارات", icon: Bell },
  { href: "/client/profile",       label: "الملف",     icon: User },
];

export function ClientNav() {
  return <MobileBottomNav items={items} />;
}
