import Link from "next/link";

export function LinkCard({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition hover:border-amber-400 hover:shadow-md"
    >
      <h3 className="text-base font-bold text-stone-900">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-stone-500">{description}</p>
    </Link>
  );
}
