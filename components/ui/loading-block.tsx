export function LoadingBlock({ label = "جارٍ تحميل البيانات..." }: { label?: string }) {
  return (
    <div className="rounded-2xl border border-amber-100 bg-white p-6">
      <div className="h-2 w-24 animate-pulse rounded bg-amber-100" />
      <p className="mt-4 text-sm text-stone-500">{label}</p>
    </div>
  );
}
