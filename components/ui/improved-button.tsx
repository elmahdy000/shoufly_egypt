import Link from "next/link";
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white hover:bg-primary/90 active:bg-primary/95 focus:ring-primary/30",
        secondary:
          "bg-slate-200 text-slate-900 hover:bg-slate-300 active:bg-slate-400 focus:ring-slate-200",
        outline:
          "border border-slate-300 text-slate-900 hover:bg-slate-50 active:bg-slate-100 focus:ring-slate-200",
        ghost:
          "text-slate-600 hover:bg-slate-50 active:bg-slate-100 focus:ring-slate-200",
        danger:
          "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-600/30",
        success:
          "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus:ring-emerald-600/30",
      },
      size: {
        sm: "px-3 py-1.5 text-sm h-8",
        md: "px-4 py-2 text-sm h-10",
        lg: "px-6 py-3 text-base h-12",
        xl: "px-8 py-4 text-base h-14",
      },
      full: {
        true: "w-full",
        false: "w-auto",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      full: false,
    },
  }
);

interface ImprovedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  href?: string;
  target?: string;
}

export const ImprovedButton = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ImprovedButtonProps
>(
  (
    {
      className,
      variant,
      size,
      full,
      isLoading,
      loadingText,
      disabled,
      children,
      href,
      target,
      ...props
    },
    ref
  ) => {
    const commonClasses = cn(buttonVariants({ variant, size, full, className }));

    if (href) {
      return (
        <Link
          href={href}
          target={target}
          className={commonClasses}
          ref={ref as React.Ref<HTMLAnchorElement>}
          {...(props as any)}
        >
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        disabled={disabled || isLoading}
        className={commonClasses}
        {...props}
      >
        {isLoading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {loadingText || children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

ImprovedButton.displayName = "ImprovedButton";
