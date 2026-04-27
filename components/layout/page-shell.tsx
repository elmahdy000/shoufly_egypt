export function PageShell({ children }: { children: React.ReactNode }) {
  // pb-28 for mobile bottom nav (68px nav + 44px safe area)
  // pb-8 for desktop (no bottom nav)
  return (
    <main className="relative mx-auto w-full max-w-[1600px] min-w-0 px-4 py-6 pb-28 sm:px-6 md:py-8 md:pb-10 lg:px-8">
      {children}
    </main>
  );
}
