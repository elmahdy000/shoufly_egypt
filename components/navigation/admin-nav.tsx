"use client";

import { Sidebar, SidebarItem } from "@/components/layout/sidebar";
import { 
  FiGrid, 
  FiPackage, 
  FiRepeat, 
  FiDollarSign, 
  FiArrowUpCircle, 
  FiTrendingUp, 
  FiUsers, 
  FiSettings 
} from "react-icons/fi";

const items: SidebarItem[] = [
  { href: "/admin", label: "لوحة التحكم", icon: FiGrid },
  { href: "/admin/requests", label: "الطلبات", icon: FiPackage },
  { href: "/admin/bids", label: "العروض", icon: FiRepeat },
  { href: "/admin/refunds", label: "المستردات", icon: FiRepeat },
  { href: "/admin/withdrawals", label: "السحوبات", icon: FiArrowUpCircle },
  { href: "/admin/finance", label: "المالية", icon: FiTrendingUp },
  { href: "/admin/users", label: "المستخدمون", icon: FiUsers },
  { href: "/admin/settings", label: "الإعدادات", icon: FiSettings },
];

export function AdminNav() {
  return <Sidebar title="الإدارة" items={items} />;
}
