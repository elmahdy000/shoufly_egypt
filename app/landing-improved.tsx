"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ShieldCheck,
  Zap,
  Users,
  Check,
  Truck,
  Briefcase,
  Star,
  FileText,
  MessageSquare,
  CreditCard,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────

const STATS = [
  { value: "+500", label: "صنايعي ومورد معتمد" },
  { value: "12K", label: "طلب خلص بنجاح" },
  { value: "98%", label: "نسبة رضا العملاء" },
  { value: "<45m", label: "متوسط وقت أول رد" },
];

const STEPS = [
  {
    num: "01",
    title: "نزل طلبك",
    desc: "اشرح اللي محتاجه وضيف صور واضحة وحدد مكانك",
    icon: FileText,
  },
  {
    num: "02",
    title: "استلم العروض",
    desc: "عروض أسعار من أفضل الصنايعية المتخصصين",
    icon: MessageSquare,
  },
  {
    num: "03",
    title: "اختار واستمتع",
    desc: "ادفع بأمان واستلم الخدمة بضمان كامل",
    icon: Check,
  },
];

const SERVICES = [
  { Icon: Zap, label: "كهرباء وسباكة" },
  { Icon: ShieldCheck, label: "صيانة وتصليح" },
  { Icon: Truck, label: "نقل عفش" },
  { Icon: Briefcase, label: "تشطيبات وديكور" },
  { Icon: Users, label: "نظافة" },
  { Icon: Zap, label: "تكنولوجيا" },
  { Icon: Truck, label: "توصيل" },
  { Icon: ShieldCheck, label: "ميكانيكا" },
];

const FEATURES = [
  "عروض أسعار منافسة في دقائق",
  "صنايعية وموردين معتمدين",
  "دفع آمن وضمان استرجاع فلوسك",
  "تابع طلبك خطوة بخطوة",
  "خدمة عملاء ٢٤ ساعة",
  "بدون رسوم على العميل",
];

export default function ImprovedLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main
      className="min-h-screen bg-white text-slate-900 antialiased overflow-x-hidden"
      dir="rtl"
    >
      {/* ─── Navigation ─────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-base font-black text-white shadow-lg">
                ش
              </div>
              <span className="hidden sm:block text-xl font-black text-slate-900">
                شوفلي
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 hover:text-slate-900 font-medium transition">
                المميزات
              </a>
              <a href="#how-it-works" className="text-slate-600 hover:text-slate-900 font-medium transition">
                كيف يعمل
              </a>
              <a href="#services" className="text-slate-600 hover:text-slate-900 font-medium transition">
                الخدمات
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
              >
                دخول
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition shadow-lg"
              >
                <span>ابدأ الآن</span>
                <ChevronRight size={16} />
              </Link>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="border-t border-slate-100 py-4 md:hidden"
            >
              <div className="flex flex-col gap-4">
                <a href="#features" className="text-slate-600 hover:text-slate-900 font-medium transition px-4">
                  المميزات
                </a>
                <a href="#how-it-works" className="text-slate-600 hover:text-slate-900 font-medium transition px-4">
                  كيف يعمل
                </a>
                <a href="#services" className="text-slate-600 hover:text-slate-900 font-medium transition px-4">
                  الخدمات
                </a>
                <Link href="/login" className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition">
                  دخول
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* ─── Hero Section ───────────────────────────────────────────────── */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div>
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-bold rounded-full mb-3">
                  🚀 الحل الأمثل للخدمات في مصر
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
                  اطلب أي
                  <br />
                  <span className="text-primary">خدمة بسهولة</span>
                </h1>
              </div>

              <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
                شوفلي بتربطك بأفضل الصنايعية والموردين المعتمدين. اطلب خدمتك واستقبل عروض أسعار من محترفين في ثوان معدودة.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register?role=CLIENT"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition shadow-xl"
                >
                  <span>ابدأ الآن مجاناً</span>
                  <ChevronRight size={20} />
                </Link>
                <button className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary/5 transition">
                  <span>شاهد الفيديو</span>
                  <span className="text-2xl">▶</span>
                </button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-4 pt-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/50 border-2 border-white"
                    />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    +5000 عميل راضي
                  </p>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative h-96 md:h-full min-h-96 hidden md:flex items-center justify-center"
            >
              <div className="relative w-full h-full">
                {/* Gradient Circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200/10 rounded-full blur-3xl" />

                {/* Phone Mockup Shape */}
                <div className="relative z-10 mx-auto w-64 h-96 bg-white rounded-3xl shadow-2xl border-8 border-slate-900 overflow-hidden">
                  <div className="h-full bg-gradient-to-b from-slate-50 to-white p-4 space-y-4">
                    <div className="h-12 bg-slate-200 rounded-lg animate-pulse" />
                    <div className="h-32 bg-gradient-to-b from-primary/20 to-transparent rounded-lg animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-200 rounded animate-pulse" />
                      <div className="h-3 bg-slate-200 rounded w-4/5 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ──────────────────────────────────────────────────── */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-black text-primary">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-600 mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ───────────────────────────────────────────────── */}
      <section id="how-it-works" className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4">
              كيف يعمل شوفلي؟
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              ثلاث خطوات فقط للحصول على أفضل الخدمات من أفضل الصنايعية
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className="relative"
                >
                  {/* Connector Line */}
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-24 -right-4 w-8 h-0.5 bg-gradient-to-l from-primary to-transparent" />
                  )}

                  <div className="bg-white rounded-2xl p-8 border-2 border-slate-100 hover:border-primary transition-all duration-300 hover:shadow-xl">
                    {/* Step Number Circle */}
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white font-black text-2xl mb-4">
                      {step.num}
                    </div>

                    {/* Icon */}
                    <Icon size={40} className="text-primary mb-4" />

                    {/* Content */}
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-slate-600">{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Features ───────────────────────────────────────────────────── */}
      <section id="features" className="bg-slate-50 px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4">
              لماذا شوفلي؟
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              نحن نوفر أفضل تجربة للحصول على الخدمات
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 items-start"
              >
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary text-white">
                    <Check size={20} />
                  </div>
                </div>
                <p className="text-lg text-slate-600">{feature}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Services Grid ──────────────────────────────────────────────── */}
      <section id="services" className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4">
              الخدمات المتاحة
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              نغطي مئات الخدمات المختلفة
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {SERVICES.map((service, i) => {
              const Icon = service.Icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white border-2 border-slate-100 rounded-xl p-6 text-center hover:border-primary hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <Icon size={32} className="text-primary mx-auto mb-3" />
                  <p className="text-sm sm:text-base font-semibold text-slate-900">
                    {service.label}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-l from-primary to-primary/90 text-white px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
          >
            <h2 className="text-3xl sm:text-5xl font-black mb-4">
              جاهز تبدأ؟
            </h2>
            <p className="text-lg text-white/90 mb-8">
              انضم لآلاف العملاء الراضين واحصل على الخدمات التي تحتاجها في دقائق
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register?role=CLIENT"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary font-bold rounded-lg hover:bg-slate-50 transition"
              >
                <span>ابدأ الآن مجاناً</span>
                <ChevronRight size={20} />
              </Link>
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition">
                <span>تواصل معنا</span>
                <MessageSquare size={20} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 px-4 sm:px-6 lg:px-8 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-black text-white">
                  ش
                </div>
                <span className="font-black text-white">شوفلي</span>
              </div>
              <p className="text-sm">منصة الخدمات الموثوقة في مصر</p>
            </div>

            {/* Links */}
            {[
              { title: "المنصة", links: ["حول شوفلي", "المميزات", "الأسعار"] },
              { title: "الدعم", links: ["الأسئلة الشائعة", "التواصل", "الشروط"] },
              { title: "المجتمع", links: ["المدونة", "الأخبار", "الأحداث"] },
            ].map((col, i) => (
              <div key={i}>
                <h3 className="font-bold text-white mb-3">{col.title}</h3>
                <ul className="space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="hover:text-white transition">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">© 2024 شوفلي - جميع الحقوق محفوظة</p>
            <div className="flex gap-4">
              {["Facebook", "Twitter", "Instagram"].map((social, i) => (
                <a key={i} href="#" className="hover:text-white transition">
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
