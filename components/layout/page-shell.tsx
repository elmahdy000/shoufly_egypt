export function PageShell({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-24 md:pb-8">{children}</main>;
}
