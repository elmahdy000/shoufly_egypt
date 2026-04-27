"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  FiAirplay, FiTool, FiTruck, FiWind, 
  FiSmartphone, FiHome, FiCpu, FiBookOpen,
  FiArrowLeft, FiGrid
} from "react-icons/fi";
import { LandingCard, SectionTitle } from "./shared/Primitives";

const CATEGORIES_DATA = [
  {
    id: "maintenance",
    name: "صيانة أجهزة",
    icon: FiCpu,
    hint: "تكييفات، غسالات، ثلاجات",
    subcategories: [
      { name: "صيانة تكييف", slug: "ac-repair" },
      { name: "صيانة غسالات", slug: "washers" },
      { name: "صيانة ثلاجات", slug: "fridges" },
      { name: "صيانة بوتاجازات", slug: "stoves" },
      { name: "صيانة ميكروويف", slug: "microwave" },
      { name: "صيانة شاشات", slug: "tv-repair" },
    ]
  },
  {
    id: "electricity",
    name: "كهربا وسباكة",
    icon: FiTool,
    hint: "تأسيس وتشطيب وصيانة",
    subcategories: [
      { name: "أعمال كهرباء", slug: "electricity" },
      { name: "أعمال سباكة", slug: "plumbing" },
      { name: "تركيب فلاتر", slug: "filters" },
      { name: "تركيب سخانات", slug: "heaters" },
    ]
  },
  {
    id: "moving",
    name: "نقل وشحن",
    icon: FiTruck,
    hint: "نقل عفش، شحن محافظات",
    subcategories: [
      { name: "نقل عفش", slug: "furniture-moving" },
      { name: "شحن محافظات", slug: "shipping" },
      { name: "ونش رفع", slug: "winch" },
      { name: "تغليف عفش", slug: "packing" },
    ]
  },
  {
    id: "cleaning",
    name: "تنظيف وتعقيم",
    icon: FiWind,
    hint: "منازل، سجاد، انتريهات",
    subcategories: [
      { name: "تنظيف منازل", slug: "house-cleaning" },
      { name: "غسيل سجاد", slug: "carpet-wash" },
      { name: "تنظيف انتريهات", slug: "sofa-cleaning" },
      { name: "مكافحة حشرات", slug: "pest-control" },
    ]
  },
  {
    id: "tech",
    name: "موبايلات وتقنية",
    icon: FiSmartphone,
    hint: "صيانة سوفت وير وهاردوير",
    subcategories: [
      { name: "صيانة موبايل", slug: "mobile-repair" },
      { name: "صيانة لابتوب", slug: "laptop-repair" },
      { name: "كاميرات مراقبة", slug: "security-cams" },
      { name: "شبكات وواي فاي", slug: "networking" },
    ]
  },
  {
    id: "cars",
    name: "خدمات عربيات",
    icon: FiAirplay,
    hint: "ميكانيكا، كهربا، غسيل",
    subcategories: [
      { name: "ميكانيكا", slug: "car-mechanic" },
      { name: "كهرباء سيارات", slug: "car-electric" },
      { name: "غسيل سيارات", slug: "car-wash" },
      { name: "إصلاح كاوتش", slug: "tires" },
    ]
  },
  {
    id: "home",
    name: "ديكور وتشطيب",
    icon: FiHome,
    hint: "نقاشة، جبسوم بورد، سيراميك",
    subcategories: [
      { name: "أعمال نقاشة", slug: "painting" },
      { name: "تركيب سيراميك", slug: "ceramics" },
      { name: "جبسوم بورد", slug: "gypsum" },
      { name: "نجارة", slug: "carpentry" },
    ]
  },
  {
    id: "education",
    name: "تعليم وتدريب",
    icon: FiBookOpen,
    hint: "دروس خصوصية، كورسات لغات",
    subcategories: [
      { name: "دروس خصوصية", slug: "private-lessons" },
      { name: "كورسات لغات", slug: "languages" },
      { name: "برمجة وتصميم", slug: "coding" },
      { name: "موسيقى وفنون", slug: "arts" },
    ]
  }
];

export function CategoryExplorer() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <section className="space-y-8 py-4">
      <div className="text-center space-y-2">
        <SectionTitle 
          title="كل الخدمات اللي تقدر تطلبها" 
          icon={FiGrid} 
          className="justify-center"
        />
        <p className="text-slate-500 text-sm font-bold">اختار القسم وابدأ طلبك بسهولة من أفضل المتخصصين</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
        {CATEGORIES_DATA.map((cat) => (
          <div 
            key={cat.id}
            className="relative"
            onMouseEnter={() => setActiveCategory(cat.id)}
            onMouseLeave={() => setActiveCategory(null)}
          >
            {/* Category Card */}
            <Link href={`/categories/${cat.id}`}>
              <LandingCard 
                className={`p-6 transition-all duration-300 border-slate-100/60 rounded-[24px] group hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 cursor-pointer ${activeCategory === cat.id ? 'border-primary shadow-xl shadow-primary/5 bg-slate-50/50' : 'bg-white'}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${activeCategory === cat.id ? 'bg-primary text-white rotate-6' : 'bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                  <cat.icon size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className={`text-[15px] font-black transition-colors ${activeCategory === cat.id ? 'text-primary' : 'text-slate-900'}`}>
                    {cat.name}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400">{cat.hint}</p>
                </div>
              </LandingCard>
            </Link>

            {/* Subcategories Dropdown (Desktop) */}
            <div 
              className={`hidden lg:block absolute top-[calc(100%+8px)] right-0 left-0 z-50 transition-all duration-300 origin-top ${activeCategory === cat.id ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
            >
              <div className="bg-white border border-primary/20 shadow-2xl shadow-primary/10 rounded-[20px] p-4 grid grid-cols-2 gap-x-4 gap-y-2">
                {cat.subcategories.map((sub) => (
                  <Link 
                    key={sub.slug}
                    href={`/categories/${cat.id}/${sub.slug}`}
                    className="flex items-center gap-2 p-1.5 rounded-lg text-[11px] font-extrabold text-slate-600 hover:text-primary hover:bg-primary/5 transition-colors group"
                  >
                    <div className="w-1 h-1 rounded-full bg-slate-300 group-hover:bg-primary transition-colors"></div>
                    {sub.name}
                  </Link>
                ))}
                <Link 
                  href={`/categories/${cat.id}`}
                  className="col-span-2 mt-2 pt-2 border-t border-slate-50 text-[10px] font-black text-primary hover:gap-2 flex items-center gap-1.5 transition-all"
                >
                  استكشف الكل <FiArrowLeft size={12} />
                </Link>
              </div>
            </div>

            {/* Subcategories Mobile View (Simplified) */}
            {activeCategory === cat.id && (
              <div className="lg:hidden mt-2 bg-slate-50/80 rounded-2xl p-3 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2">
                {cat.subcategories.slice(0, 4).map((sub) => (
                  <Link 
                    key={sub.slug}
                    href={`/categories/${cat.id}/${sub.slug}`}
                    className="text-[10px] font-bold text-slate-600 p-1"
                  >
                    • {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
