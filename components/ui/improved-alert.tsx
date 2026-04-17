import React from "react";
import { AlertCircle, CheckCircle, XCircle, Info } from "lucide-react";

type AlertVariant = "info" | "success" | "warning" | "error";

interface ImprovedAlertProps {
  variant?: AlertVariant;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

const variantConfig: Record<
  AlertVariant,
  {
    bgColor: string;
    borderColor: string;
    textColor: string;
    iconColor: string;
    Icon: React.ComponentType<{ size: number; className?: string }>;
  }
> = {
  info: {
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-900",
    iconColor: "text-blue-600",
    Icon: Info,
  },
  success: {
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-900",
    iconColor: "text-emerald-600",
    Icon: CheckCircle,
  },
  warning: {
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    textColor: "text-amber-900",
    iconColor: "text-amber-600",
    Icon: AlertCircle,
  },
  error: {
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    textColor: "text-red-900",
    iconColor: "text-red-600",
    Icon: XCircle,
  },
};

export function ImprovedAlert({
  variant = "info",
  title,
  description,
  children,
  className,
  onClose,
}: ImprovedAlertProps) {
  const config = variantConfig[variant];
  const { Icon } = config;

  return (
    <div
      className={`border rounded-lg p-4 flex gap-4 ${config.bgColor} ${config.borderColor} ${className}`}
      role="alert"
    >
      <Icon size={20} className={`flex-shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="flex-1">
        {title && (
          <h3 className={`font-semibold ${config.textColor}`}>{title}</h3>
        )}
        {description && (
          <p
            className={`text-sm mt-1 ${config.textColor} opacity-90`}
          >
            {description}
          </p>
        )}
        {children && (
          <div className={`text-sm mt-2 ${config.textColor}`}>{children}</div>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`flex-shrink-0 ${config.textColor} hover:opacity-70 transition-opacity`}
          aria-label="Close alert"
        >
          ✕
        </button>
      )}
    </div>
  );
}
