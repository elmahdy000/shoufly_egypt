"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/delivery", label: "الرئيسية" },
  { href: "/delivery/tasks", label: "المهام" },
  { href: "/delivery/profile", label: "حسابي" },
];

export function DeliveryNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 right-0 left-0 z-30 border-t border-slate-200 bg-white md:hidden">
      <div className="mx-auto flex max-w-xl justify-around">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            (link.href !== "/delivery" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-1 flex-col items-center py-2 text-xs font-medium transition ${active ? "text-primary bg-slate-50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
