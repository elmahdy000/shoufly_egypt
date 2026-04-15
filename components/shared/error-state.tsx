export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/30 p-4 text-sm text-rose-700 dark:text-rose-400">
      {message}
    </div>
  );
}
