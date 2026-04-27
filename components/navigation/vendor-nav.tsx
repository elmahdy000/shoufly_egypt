"use client";

import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { Home, Package, ShoppingBag, TrendingUp, User } from "lucide-react";

export function VendorNav() {
  const items = [
    { href: "/vendor",          label: "الرئيسية", icon: Home },
    { href: "/vendor/requests", label: "الطلبات",  icon: Package },
    { href: "/vendor/bids",     label: "عروضي",    icon: ShoppingBag },
    { href: "/vendor/earnings", label: "الأرباح",  icon: TrendingUp },
    { href: "/vendor/profile",  label: "الملف",    icon: User },
  ];

  return <MobileBottomNav items={items} />;
}
