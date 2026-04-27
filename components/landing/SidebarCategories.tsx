import React from "react";
import Link from "next/link";
import { FiGrid } from "react-icons/fi";
import { Category } from "@/lib/types/landing";
import { LandingCard, SectionTitle } from "./shared/Primitives";

interface SidebarCategoriesProps {
  categories: Category[];
}

export function SidebarCategories({ categories }: SidebarCategoriesProps) {
  return (
    <LandingCard className="space-y-4 p-5 rounded-[20px] border-slate-100/60">
      <SectionTitle title="الأقسام" icon={FiGrid} iconColor="text-primary" />
      <nav className="flex flex-col gap-1.5">
        {categories.map(cat => (
          <Link
            key={cat.id}
            href={`/client/requests/new?category=${encodeURIComponent(cat.name)}`}
            className="flex items-center gap-3 p-2.5 rounded-xl text-[12px] font-black text-slate-700 hover:bg-primary/5 hover:text-primary transition-all group border border-transparent hover:border-primary/10"
          >
            <cat.icon size={16} className="text-slate-400 group-hover:text-primary transition-colors" />
            <span className="leading-none">{cat.name}</span>
          </Link>
        ))}
      </nav>
    </LandingCard>
  );
}
