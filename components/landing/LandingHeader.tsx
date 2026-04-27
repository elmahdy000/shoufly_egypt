"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FiShield, FiHome, FiHelpCircle, FiPlusSquare, FiMessageCircle, FiChevronLeft } from "react-icons/fi";
import { ImprovedButton } from "@/components/ui/improved-button";
import { UserRole } from "@/lib/types/landing";

interface LandingHeaderProps {
  userRole?: UserRole;
}

export function LandingHeader({ userRole }: LandingHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "الرئيسية", icon: FiHome, href: "/" },
    { name: "بيشتغل إزاي", icon: FiHelpCircle, href: "#" },
    { name: "اطلب خدمة", icon: FiPlusSquare, href: "/client/requests/new" },
  ];

  return (
    <>
      <header className={`sticky top-0 z-[1000] w-full flex justify-center pt-4 pb-2 px-6 transition-all duration-500 ${scrolled ? "bg-slate-50/80 backdrop-blur-md" : "bg-transparent"}`}>
        <nav className={`w-full max-w-6xl h-14 px-4 sm:px-6 rounded-full flex items-center justify-between transition-all duration-300 ${scrolled ? "bg-white border border-slate-200/60 shadow-md" : "bg-white border border-slate-100 shadow-sm"}`}>
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <FiShield size={18} />
            </div>
            <span className="text-sm sm:text-base font-black text-slate-900 tracking-tighter">شوفلي</span>
          </Link>

          {/* MAIN NAV - HIDDEN ON MOBILE */}
          <div className="hidden md:flex items-center gap-8 border-x border-slate-100 px-8 h-6">
            {navLinks.map(item => (
              <Link key={item.name} href={item.href} className="flex items-center gap-2 group whitespace-nowrap">
                <item.icon size={14} className="text-slate-500 group-hover:text-amber-500 transition-colors" />
                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition-colors">{item.name}</span>
              </Link>
            ))}
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {!userRole ? (
              <div className="flex items-center">
                <Link href="/login" className="text-[11px] sm:text-xs font-extrabold text-slate-600 hover:text-slate-900 px-2 sm:px-4">
                  دخول
                </Link>
                <Link href="/register?role=CLIENT">
                  <ImprovedButton size="sm" className="bg-primary text-white px-4 sm:px-6 h-8 sm:h-9 rounded-full text-[10px] sm:text-[11px] font-black shadow-md hover:translate-y-[-1px] transition-all">
                    اطلب خدمة
                  </ImprovedButton>
                </Link>
              </div>
            ) : (
              <Link href={userRole.toUpperCase() === 'VENDOR' ? '/vendor' : userRole.toUpperCase() === 'ADMIN' ? '/admin' : '/client'}>
                <ImprovedButton size="sm" className="bg-slate-900 text-white px-4 sm:px-6 h-8 sm:h-9 rounded-full text-[10px] sm:text-[11px] font-black shadow-md hover:translate-y-[-1px] transition-all">
                  لوحة التحكم
                </ImprovedButton>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-8 h-8 flex items-center justify-center text-slate-900 bg-slate-50 rounded-full border border-slate-200"
            >
              <div className="flex flex-col gap-1 w-4">
                <span className={`h-0.5 w-full bg-slate-900 rounded-full transition-all ${mobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
                <span className={`h-0.5 w-full bg-slate-900 rounded-full transition-all ${mobileMenuOpen ? "opacity-0" : ""}`} />
                <span className={`h-0.5 w-full bg-slate-900 rounded-full transition-all ${mobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
              </div>
            </button>
          </div>
        </nav>
      </header>

      {/* MOBILE DRAWER */}
      <div className={`fixed inset-0 z-[2000] lg:hidden transition-all duration-300 ${mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
        <div className={`absolute left-0 right-0 top-0 bg-white rounded-b-[2rem] p-6 pt-20 shadow-2xl transition-transform duration-300 ${mobileMenuOpen ? "translate-y-0" : "-translate-y-full"}`}>
          <div className="space-y-4 text-right" dir="rtl">
            {navLinks.map(item => (
              <Link 
                key={item.name} 
                href={item.href} 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-primary/10 group transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary shadow-sm">
                    <item.icon size={20} />
                  </div>
                  <span className="font-black text-slate-900">{item.name}</span>
                </div>
                <FiChevronLeft size={18} className="text-slate-300 group-hover:text-primary transition-colors" />
              </Link>
            ))}
            <div className="pt-4 grid grid-cols-2 gap-4">
              <Link href="/register?role=VENDOR" onClick={() => setMobileMenuOpen(false)} className="bg-slate-100 text-slate-900 py-4 rounded-2xl text-center text-xs font-black">
                انضم كمورد
              </Link>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="bg-slate-900 text-white py-4 rounded-2xl text-center text-xs font-black">
                دخول
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
