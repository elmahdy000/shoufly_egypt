import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "line" | "circle" | "card" | "text" | "button";
  count?: number;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "line", count = 1, ...props }, ref) => {
    const baseClass =
      "bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse rounded";

    const variants = {
      line: "h-4 w-full",
      circle: "h-10 w-10 rounded-full",
      card: "h-32 w-full rounded-lg",
      text: "h-6 w-3/4",
      button: "h-10 w-24 rounded-lg",
    };

    if (count > 1) {
      return (
        <div className="space-y-2">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className={cn(baseClass, variants[variant], className)}
              ref={i === 0 ? ref : undefined}
              {...props}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(baseClass, variants[variant], className)}
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

interface ImprovedLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  variant?: SkeletonProps["variant"];
  count?: number;
}

export function ImprovedLoading({
  isLoading,
  children,
  skeleton,
  variant = "line",
  count = 1,
}: ImprovedLoadingProps) {
  if (isLoading) {
    return skeleton || <Skeleton variant={variant} count={count} />;
  }

  return <>{children}</>;
}

interface ImprovedLoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function ImprovedLoadingSpinner({
  size = "md",
  text,
}: ImprovedLoadingSpinnerProps) {
  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }[size];

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizeClass} animate-spin text-primary`} />
      {text && <p className="text-sm text-slate-600">{text}</p>}
    </div>
  );
}

export { Skeleton };
