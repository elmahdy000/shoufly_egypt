"use client";

import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { FiHome, FiPackage, FiDollarSign, FiBell, FiUser } from "react-icons/fi";

const items = [
  { href: "/client",               label: "الرئيسية",  icon: <FiHome size={19} /> },
  { href: "/client/requests",      label: "الطلبات",   icon: <FiPackage size={19} /> },
  { href: "/client/wallet",        label: "المحفظة",   icon: <FiDollarSign size={19} /> },
  { href: "/client/notifications", label: "الإشعارات", icon: <FiBell size={19} /> },
  { href: "/client/profile",       label: "الملف",     icon: <FiUser size={19} /> },
];

export function ClientNav() {
  return <MobileBottomNav items={items} />;
}
