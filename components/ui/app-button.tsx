export function AppButton({
  children,
  type = "button",
  onClick,
  variant = "primary",
  disabled = false,
}: {
  children: React.ReactNode;
  type?: "button" | "submit";
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}) {
  const variantClass =
    variant === "danger"
      ? "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
      : variant === "secondary"
        ? "bg-stone-800 hover:bg-stone-900 shadow-stone-200"
        : "bg-amber-600 hover:bg-amber-700 shadow-amber-200";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition disabled:cursor-not-allowed disabled:bg-stone-300 ${variantClass}`}
    >
      {children}
    </button>
  );
}
