import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

const items = [
  { href: "/client", label: "الرئيسية" },
  { href: "/client/requests", label: "الطلبات" },
  { href: "/client/wallet", label: "المحفظة" },
  { href: "/client/notifications", label: "الإشعارات" },
  { href: "/client/profile", label: "الملف" },
];

export function ClientNav() {
  return <MobileBottomNav items={items} />;
}
