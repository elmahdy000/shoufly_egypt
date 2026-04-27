"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { UserRole, Category, FeaturedService, Deal } from "@/lib/types/landing";
import { 
  FiArrowRight, FiCheckCircle, FiShield, FiStar, FiClock, 
  FiTool, FiBox, FiSmartphone, FiCheck, FiX, FiChevronDown, FiAward,
  FiGrid, FiUsers, FiZap, FiHome, FiTruck, FiActivity, FiDroplet, FiCpu
} from "react-icons/fi";

// --- STATIC ARRAYS (Performance: Moved outside components to prevent recreation) ---
const STEPS = [
  { num: "01", title: "ارفع طلبك ببلاش", desc: "اكتب تفاصيل اللي محتاجه، سواء صيانة، منتج، أو خدمة، في أقل من دقيقة." },
  { num: "02", title: "استقبل عروض الأسعار", desc: "الموردين المتخصصين هيشوفوا طلبك وهيبعتولك عروض أسعار تنافسية في ساعتها." },
  { num: "03", title: "اختار وادفع بأمان", desc: "قارن التقييمات والأسعار، ادفع بأمان عن طريق المنصة، وفلوسك في الحفظ والصون لحد ما تستلم." },
];

const FAQS = [
  { q: "إزاي أضمن حقي كمشتري؟", a: "الفلوس بتفضل في محفظة شوفلي الآمنة (Escrow) ومابتتحولش للمورد غير لما تستلم الخدمة أو المنتج وتأكد إنك راضي عنه 100%." },
  { q: "هل رفع الطلب بفلوس؟", a: "لأ خالص، رفع الطلبات على منصة شوفلي مجاني تماماً للعملاء. إنت بتدفع بس قيمة العرض اللي بتوافق عليه." },
  { q: "إزاي بختار أحسن مورد؟", a: "كل مورد ليه بروفايل فيه تقييماته من عملاء قبلك، وسابقة أعماله. تقدر تقارن بين العروض، السعر، والتقييم قبل ما تختار." },
];

// --- 1. HERO SECTION ---
export function HeroSection({ userRole }: { userRole: UserRole | null }) {
  return (
    <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <div className="absolute inset-0 bg-slate-50 z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-bold mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          المنصة الأولى لطلب الخدمات والمنتجات في مصر
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6 max-w-4xl mx-auto">
          اطلب اللي محتاجه، وسيب <span className="text-primary">السوق يتنافس</span> عشانك
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
          سواء بتدور على صيانة، تشطيب، أو قطع غيار. ارفع طلبك ببلاش واستقبل أحسن عروض الأسعار من مئات المتخصصين المعتمدين في دقايق.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/client/requests/new" className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover shadow-md transition-colors flex items-center justify-center gap-2">
            اطلب دلوقتي ببلاش <FiArrowRight />
          </Link>
          {(!userRole || userRole !== 'VENDOR') && (
            <Link href="/register/vendor" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 font-bold rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm transition-colors flex items-center justify-center gap-2">
              سجل كمورد معتمد
            </Link>
          )}
        </div>

        <div className="mt-12 flex items-center justify-center gap-6 text-slate-500 text-sm font-bold opacity-80">
          <div className="flex items-center gap-2"><FiShield className="text-primary" /> الدفع آمن</div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
          <div className="flex items-center gap-2"><FiClock className="text-primary" /> عروض فورية</div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
          <div className="flex items-center gap-2"><FiStar className="text-primary" /> معتمدين</div>
        </div>
      </div>
    </section>
  );
}

// --- 2. TRUST SECTION ---
export function TrustSection() {
  return (
    <section className="py-10 border-y border-slate-100 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">يثق بنا أكثر من 10,000 مستخدم وشركة</p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale">
          <div className="flex items-center gap-2 font-black text-xl text-slate-900"><FiBox size={24} /> BuildCo</div>
          <div className="flex items-center gap-2 font-black text-xl text-slate-900"><FiTool size={24} /> FixIt Egypt</div>
          <div className="flex items-center gap-2 font-black text-xl text-slate-900"><FiSmartphone size={24} /> TechZone</div>
          <div className="flex items-center gap-2 font-black text-xl text-slate-900"><FiShield size={24} /> SafeGuard</div>
        </div>
      </div>
    </section>
  );
}

import { CategoryCard, SubcategoryPill, BrandCard, CategoryGrid, HorizontalScroll } from "@/components/shoofly/category-ui";

// Mapping icons to category names

const ICON_MAP: Record<string, any> = {
  "صيانة أجهزة": FiCpu,
  "خدمات منزلية": FiHome,
  "شحن وتوصيل": FiTruck,
  "صحة وطب": FiActivity,
  "تقنية وموبايل": FiSmartphone,
  "سباكة وكهرباء": FiTool,
  "صيانة تكييف": FiZap,
  "تنظيف منازل": FiHome,
  "تشطيبات": FiDroplet,
  "FiCheckCircle": FiCheckCircle,
  "FiUsers": FiUsers,
  "FiShield": FiShield,
  "FiZap": FiZap,
  "FiGrid": FiGrid
};

const getIcon = (icon: any, size: number = 24) => {
  if (typeof icon === 'string') {
    const Icon = ICON_MAP[icon] || FiGrid;
    return <Icon size={size} />;
  }
  if (typeof icon === 'function') {
    const Icon = icon;
    return <Icon size={size} />;
  }
  return <FiGrid size={size} />;
};

// --- 3. REDESIGNED CATEGORY EXPLORER ---
export function RedesignedCategoryExplorer({ 
  categories, 
  brands 
}: { 
  categories: Category[], 
  brands: any[] 
}) {
  const [activeTab, setActiveTab] = React.useState(categories[0]?.id || 0);

  // Mock subcategories for demonstration if not provided in the main categories list
  const subcategories = [
    "صيانة سريعة", "قطع غيار أصلي", "تركيب وتركيب", "ضمان معتمد", "خدمة فورية"
  ];

  if (!categories?.length) return null;

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-6 bg-primary rounded-full" />
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">لف في الأقسام</h2>
            </div>
            <p className="text-slate-500 font-medium text-lg">كل اللي محتاجه في مكان واحد، متقسم صح عشان تلاقي اللي بتدور عليه بسهولة.</p>
          </div>
          <Link href="/categories" className="inline-flex items-center gap-2 text-sm font-black text-primary bg-primary/5 px-6 py-3 rounded-2xl hover:bg-primary/10 transition-all group">
            شوف كل التصنيفات <FiArrowRight className="group-hover:translate-x-[-4px] transition-transform" />
          </Link>
        </div>
        
        {/* Subcategories Horizontal Scroll (Legacy UI requirement: Pills/Chips) */}
        <div className="mb-10">
          <HorizontalScroll label="أهم التخصصات">
            {subcategories.map((sub, i) => (
              <SubcategoryPill 
                key={i} 
                name={sub} 
                isActive={i === 0} 
              />
            ))}
          </HorizontalScroll>
        </div>

        {/* Main Categories Grid (Premium Cards) */}
        <div className="mb-20">
          <CategoryGrid>
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                id={Number(cat.id)}
                name={cat.name}
                count={Number(cat.count || 0)}
                icon={getIcon(cat.icon, 24)}
                isActive={activeTab === cat.id}
              />
            ))}
          </CategoryGrid>
        </div>

        {/* Brands Section (Logo Strip) */}
        {brands.length > 0 && (
          <div className="pt-20 border-t border-slate-100">
            <div className="mb-10">
              <h3 className="text-xl font-black text-slate-900 mb-2">أشهر الماركات المتاحة</h3>
              <p className="text-slate-400 text-sm font-bold">موردين معتمدين لأكبر العلامات التجارية العالمية والمحلية.</p>
            </div>
            <HorizontalScroll>
              {brands.map((brand) => (
                <BrandCard
                  key={brand.id}
                  name={brand.name}
                  logo={brand.logo}
                  count={(brand.id * 7) % 50 + 10}
                />
              ))}
            </HorizontalScroll>
          </div>
        )}
      </div>
    </section>
  );
}

// --- 4. HOW IT WORKS ---
export function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-slate-900 mb-4">إزاي شوفلي بيشتغل؟</h2>
          <p className="text-slate-500 font-medium">3 خطوات بسيطة بتفصلك عن تنفيذ طلبك بأحسن سعر.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
          <div className="hidden md:block absolute top-8 right-1/6 left-1/6 h-px bg-slate-100 z-0"></div>
          {STEPS.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white border-4 border-slate-50 rounded-full flex items-center justify-center text-xl font-black text-primary mb-4 shadow-sm">
                {step.num}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- 5. COMPARISON BLOCK ---
export function ComparisonBlock() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-slate-900 mb-4">ليه تختار شوفلي؟</h2>
          <p className="text-slate-500 font-medium">الفرق بين الطريقة القديمة وتجربة شوفلي السهلة.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm opacity-80">
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <FiX className="text-red-500 bg-red-50 rounded-full p-1" size={20} /> الطريقة التقليدية
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-slate-600 font-medium"><FiX className="text-slate-300 mt-0.5 shrink-0" /> تضييع وقت في التدوير على صنايعي أو مورد.</li>
              <li className="flex items-start gap-2 text-sm text-slate-600 font-medium"><FiX className="text-slate-300 mt-0.5 shrink-0" /> أسعار عشوائية ومفيش معيار للتكلفة.</li>
              <li className="flex items-start gap-2 text-sm text-slate-600 font-medium"><FiX className="text-slate-300 mt-0.5 shrink-0" /> مفيش أي ضمان على جودة الشغل.</li>
              <li className="flex items-start gap-2 text-sm text-slate-600 font-medium"><FiX className="text-slate-300 mt-0.5 shrink-0" /> الدفع كاش ومفيش حاجة تضمن حقك.</li>
            </ul>
          </div>
          
          <div className="bg-white border border-primary/20 rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
              <FiCheck className="text-white bg-primary rounded-full p-1" size={20} /> منصة شوفلي
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-slate-900 font-bold"><FiCheckCircle className="text-primary mt-0.5 shrink-0" /> ارفع طلبك مرة واحدة والموردين هما اللي يجيلوك.</li>
              <li className="flex items-start gap-2 text-sm text-slate-900 font-bold"><FiCheckCircle className="text-primary mt-0.5 shrink-0" /> تنافس في الأسعار بيضمنلك أقل تكلفة.</li>
              <li className="flex items-start gap-2 text-sm text-slate-900 font-bold"><FiCheckCircle className="text-primary mt-0.5 shrink-0" /> موردين معتمدين وتقييمات حقيقية من عملاء زيك.</li>
              <li className="flex items-start gap-2 text-sm text-slate-900 font-bold"><FiCheckCircle className="text-primary mt-0.5 shrink-0" /> الدفع آمن من خلال المنصة.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// --- 6. POPULAR SERVICES ---
export function PopularServices({ services }: { services: FeaturedService[] }) {
  if (!services?.length) return null;
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-2xl font-black text-slate-900 mb-8 text-center">أكتر خدمات بتنطلب</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {services.map(service => (
            <Link key={service.id} href={`/client/requests/new?service=${encodeURIComponent(service.name)}`} className="group p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-white hover:border-primary/30 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="w-8 h-8 bg-white text-slate-400 rounded-lg shadow-sm flex items-center justify-center group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                  {getIcon(service.icon, 16)}
                </div>
                {service.popular && <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">شائع</span>}
              </div>
              <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors text-sm mb-1">{service.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-1">اطلب عروض أسعار</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- 7. IMPROVED DEALS (Optimized with next/image) ---
export function ImprovedDeals({ deals }: { deals: Deal[] }) {
  if (!deals?.length) return null;
  return (
    <section className="py-20 bg-slate-900 text-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
              <FiAward className="text-primary" /> عروض حصرية
            </h2>
            <p className="text-slate-400 text-sm font-medium">خصومات حقيقية من الموردين المعتمدين.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {deals.map(deal => (
            <div key={deal.id} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-primary/50 transition-colors group">
              <div className="h-40 relative bg-slate-900">
                <Image 
                  src={deal.img} 
                  alt={deal.title} 
                  fill 
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                  priority={false}
                />
                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-full shadow-sm">خصم خاص</div>
              </div>
              <div className="p-5">
                <h3 className="text-base font-bold text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">{deal.title}</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-xl font-black text-white">{deal.price} <span className="text-xs font-bold text-slate-400">ج.م</span></span>
                  {deal.oldPrice && <span className="text-xs font-bold text-slate-500 line-through">{deal.oldPrice} ج.م</span>}
                </div>
                <Link href={`/client/requests/new?service=${encodeURIComponent(deal.title)}&dealId=${deal.id}`} className="block w-full text-center py-2.5 bg-white text-slate-900 text-sm font-bold rounded-lg hover:bg-primary hover:text-white transition-colors">
                  احجز العرض
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- 8. FAQ SECTION ---
export function FAQSection() {
  return (
    <section className="py-20 bg-white border-t border-slate-100">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl font-black text-slate-900 mb-8 text-center">أسئلة بتسألوها كتير</h2>
        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="border border-slate-200 rounded-xl p-5 hover:border-primary/30 transition-colors bg-slate-50 hover:bg-white">
              <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center justify-between">
                {faq.q} <FiChevronDown className="text-slate-400" />
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- 9. FINAL CTA ---
export function FinalCTA({ userRole }: { userRole: UserRole | null }) {
  return (
    <section className="py-20 bg-primary text-white text-center">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl font-black mb-4 leading-tight">وفر فلوسك ووقتك، واطلب من شوفلي دلوقتي.</h2>
        <p className="text-primary-subtle text-base font-medium mb-8 opacity-90">انضم لآلاف المصريين اللي بيعتمدوا على شوفلي لتنفيذ طلباتهم يومياً بأمان تام.</p>
        <Link href="/client/requests/new" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary font-black text-base rounded-xl hover:bg-slate-50 transition-colors">
          ابدأ طلبك الأول ببلاش <FiArrowRight />
        </Link>
      </div>
    </section>
  );
}
