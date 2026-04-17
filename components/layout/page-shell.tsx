export function PageShell({ children }: { children: React.ReactNode }) {
  // pb-20 for mobile (navbar 64px + safe area)
  // pb-8 for tablet/desktop (no bottom nav)
  return (
    <main className="mx-auto w-full max-w-[1440px] px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6 pb-20 md:pb-8">
      {children}
    </main>
  );
}
