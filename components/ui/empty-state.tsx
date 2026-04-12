export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 p-10 text-center">
      <h3 className="text-lg font-bold text-stone-800">{title}</h3>
      <p className="mt-2 text-sm text-stone-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
