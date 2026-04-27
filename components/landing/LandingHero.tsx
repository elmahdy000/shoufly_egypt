"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FiZap, FiUsers, FiSearch } from "react-icons/fi";
import { ImprovedButton } from "@/components/ui/improved-button";
import { UserRole } from "@/lib/types/landing";

interface LandingHeroProps {
  userRole?: UserRole;
}

export function LandingHero({ userRole }: LandingHeroProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (userRole === 'VENDOR') {
      router.push(`/vendor/requests${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`);
    } else if (userRole === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push(`/client/requests/new${searchQuery ? `?service=${encodeURIComponent(searchQuery)}` : ''}`);
    }
  };

  const buttonText = userRole === 'VENDOR' ? 'ابحث عن طلبات' : userRole === 'ADMIN' ? 'لوحة التحكم' : 'ابدأ طلبك';

  return (
    <section className="bg-white border border-slate-200/60 rounded-[32px] p-8 md:p-12 relative overflow-hidden shadow-sm">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl"></div>
      <div className="relative z-10 space-y-5">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black">
          <FiZap className="fill-primary" size={12} /> منصة الخدمات الأولى في مصر
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tighter max-w-2xl">
            اطلب اللي محتاجه.. <br />
            <span className="text-primary">وسيب السوق يرد عليك</span>
          </h1>
          <p className="text-[11px] font-extrabold text-slate-500 flex items-center gap-2">
            <FiUsers size={14} className="text-primary" /> أكثر من 50,000 مستخدم ومزود خدمة يثقون في شوفلي
          </p>
        </div>
        
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 pt-4 max-w-xl">
          <div className="relative flex-1 group">
            <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بتدور على خدمة إيه؟"
              className="w-full h-12 bg-white border-2 border-slate-100 rounded-2xl pr-12 pl-4 text-sm font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all text-right shadow-sm placeholder:text-slate-400"
            />
          </div>
          <ImprovedButton 
            type="submit"
            className="bg-primary text-white px-10 h-12 rounded-2xl font-black shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:translate-y-[-1px] transition-all"
          >
            {buttonText}
          </ImprovedButton>
        </form>
      </div>
    </section>
  );
}
