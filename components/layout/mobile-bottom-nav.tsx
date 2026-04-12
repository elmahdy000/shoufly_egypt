import Link from "next/link";

export type MobileNavItem = { href: string; label: string };

export function MobileBottomNav({ items }: { items: MobileNavItem[] }) {
  return (
    <nav className="fixed bottom-0 start-0 end-0 z-30 border-t border-slate-200 bg-white px-2 py-2 md:hidden">
      <ul className="mx-auto grid max-w-xl gap-1" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-lg px-2 py-2 text-center text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
