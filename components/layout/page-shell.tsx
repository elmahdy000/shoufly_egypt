export function PageShell({ children }: { children: React.ReactNode }) {
  // pb-28 for mobile bottom nav (68px nav + 44px safe area)
  // pb-8 for desktop (no bottom nav)
  return <main className="mx-auto w-full max-w-[1440px] px-4 py-6 pb-28 md:pb-8">{children}</main>;
}
