import Link from "next/link";

export function LinkCard({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-amber-100 dark:border-amber-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md"
    >
      <h3 className="text-base font-bold text-stone-900 dark:text-slate-100">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-stone-500 dark:text-slate-400">{description}</p>
    </Link>
  );
}
