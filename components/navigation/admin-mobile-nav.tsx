"use client";

import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { LayoutGrid, Package, Truck, BarChart3, Users } from "lucide-react";

const items = [
  { href: "/admin",            label: "الرئيسية", icon: LayoutGrid },
  { href: "/admin/requests",   label: "الطلبات",  icon: Package },
  { href: "/admin/tracking",   label: "التتبع",   icon: Truck },
  { href: "/admin/analytics",  label: "التحليلات", icon: BarChart3 },
  { href: "/admin/users",      label: "الأعضاء",   icon: Users },
];

export function AdminMobileNav() {
  return <MobileBottomNav items={items} />;
}
