import React from 'react';
import Link from 'next/link';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    isUp: boolean;
  };
  icon?: React.ReactNode;
  href?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, trend, icon, href, className }) => {
  const content = (
    <div className={`shoofly-card p-4 md:p-6 bg-white overflow-hidden transition-all ${href ? 'hover:border-primary/50 hover:shadow-md cursor-pointer' : ''} ${className || ''}`}>
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</p>
          <h3 className="text-2xl font-bold font-jakarta text-slate-900 pt-1">
            {value}
          </h3>
          
          {trend && (
            <div className={`flex items-center text-xs font-bold gap-1 mt-2 ${
              trend.isUp ? 'text-emerald-700' : 'text-rose-700'
            }`}>
              <span className="text-[10px]">
                {trend.isUp ? '▲' : '▼'}
              </span>
              <span className="font-jakarta">{trend.value}</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="p-2 bg-slate-50 border border-slate-100 rounded text-slate-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
};
