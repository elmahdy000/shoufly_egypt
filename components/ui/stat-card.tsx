export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-stone-900">{value}</p>
    </div>
  );
}
