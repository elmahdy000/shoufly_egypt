export function AppCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
      {children}
    </div>
  );
}
