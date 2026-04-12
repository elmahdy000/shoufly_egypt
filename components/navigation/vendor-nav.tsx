import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

const items = [
  { href: "/vendor", label: "الرئيسية" },
  { href: "/vendor/requests", label: "الطلبات" },
  { href: "/vendor/bids", label: "عروضي" },
  { href: "/vendor/earnings", label: "الأرباح" },
  { href: "/vendor/profile", label: "الملف" },
];

export function VendorNav() {
  return <MobileBottomNav items={items} />;
}
