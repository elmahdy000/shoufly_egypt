import React from "react";

interface LandingCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'white' | 'dark';
}

export function LandingCard({ children, className = "", variant = 'white' }: LandingCardProps) {
  const baseStyles = "rounded-2xl p-5 shadow-sm transition-all duration-300";
  const variants = {
    white: "bg-white border border-slate-200/60 hover:shadow-md",
    dark: "bg-slate-900 text-white shadow-xl shadow-slate-900/10 border border-white/5"
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}

interface SectionTitleProps {
  title: string;
  icon?: React.ElementType;
  iconColor?: string;
  subtitle?: string;
  className?: string;
}

export function SectionTitle({ 
  title, 
  icon: Icon, 
  iconColor = "text-amber-500", 
  subtitle, 
  className = "" 
}: SectionTitleProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <h2 className="text-[11px] font-black text-slate-900 flex items-center gap-2">
        {Icon && <Icon className={iconColor} size={14} />}
        {title}
      </h2>
      {subtitle && <p className="text-[9px] font-bold text-slate-400">{subtitle}</p>}
    </div>
  );
}
