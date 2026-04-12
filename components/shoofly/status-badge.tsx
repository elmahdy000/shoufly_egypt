import React from 'react';

type StatusType = 'pending' | 'active' | 'completed' | 'cancelled';

interface BadgeProps {
  status: StatusType;
  label: string;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, label }) => {
  const styles = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    active: "bg-blue-50 text-blue-700 border-blue-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const dots = {
    pending: "bg-amber-500",
    active: "bg-blue-500",
    completed: "bg-emerald-500",
    cancelled: "bg-rose-500",
  };

  return (
    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ml-1.5 ${dots[status]}`} />
      {label}
    </div>
  );
};
