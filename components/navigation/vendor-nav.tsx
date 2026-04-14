"use client";

import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { FiHome, FiPackage, FiTag, FiTrendingUp, FiUser } from "react-icons/fi";

const items = [
  { href: "/vendor",          label: "الرئيسية", icon: <FiHome size={19} /> },
  { href: "/vendor/requests", label: "الطلبات",  icon: <FiPackage size={19} /> },
  { href: "/vendor/bids",     label: "عروضي",    icon: <FiTag size={19} /> },
  { href: "/vendor/earnings", label: "الأرباح",  icon: <FiTrendingUp size={19} /> },
  { href: "/vendor/profile",  label: "الملف",    icon: <FiUser size={19} /> },
];

export function VendorNav() {
  return <MobileBottomNav items={items} />;
}
