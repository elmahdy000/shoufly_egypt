"use client";

import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { Home, ClipboardList, User, Bell } from "lucide-react";

const items = [
  { href: "/delivery",               label: "الرئيسية", icon: Home },
  { href: "/delivery/tasks",         label: "المهام",   icon: ClipboardList },
  { href: "/delivery/notifications", label: "الإشعارات", icon: Bell },
  { href: "/delivery/profile",       label: "حسابي",    icon: User },
];

export function DeliveryNav() {
  return <MobileBottomNav items={items} />;
}
