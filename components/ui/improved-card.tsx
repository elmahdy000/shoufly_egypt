import React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ComponentType<{ size: number; className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      {Icon && (
        <Icon
          size={48}
          className="mb-4 text-slate-300"
        />
      )}
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      {description && (
        <p className="text-slate-500 text-sm mb-4 max-w-sm">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

interface ImprovedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  bordered?: boolean;
  padded?: boolean;
}

export const ImprovedCard = React.forwardRef<HTMLDivElement, ImprovedCardProps>(
  ({ className, children, bordered = true, padded = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg bg-white transition-all duration-200",
        bordered && "border border-slate-200",
        padded && "p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);

ImprovedCard.displayName = "ImprovedCard";

interface StatusBadgeProps {
  status:
    | "active"
    | "inactive"
    | "pending"
    | "approved"
    | "rejected"
    | "processing"
    | "completed";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const statusConfig = {
  active: { bg: "bg-emerald-50", text: "text-emerald-700", label: "نشط" },
  inactive: { bg: "bg-slate-50", text: "text-slate-700", label: "معطل" },
  pending: { bg: "bg-amber-50", text: "text-amber-700", label: "قيد الانتظار" },
  approved: { bg: "bg-blue-50", text: "text-blue-700", label: "موافق عليه" },
  rejected: { bg: "bg-red-50", text: "text-red-700", label: "مرفوض" },
  processing: { bg: "bg-purple-50", text: "text-purple-700", label: "قيد المعالجة" },
  completed: { bg: "bg-emerald-50", text: "text-emerald-700", label: "مكتمل" },
};

export function StatusBadge({ status, size = "md", className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.inactive;
  const sizeClass = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  }[size];

  return (
    <span
      className={cn(
        "inline-block rounded-full font-semibold",
        config.bg,
        config.text,
        sizeClass,
        className
      )}
    >
      {config.label}
    </span>
  );
}
