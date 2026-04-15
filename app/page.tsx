import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "شوفلي — اطلب أي خدمة في ثواني",
  description:
    "شوفلي بتربطك بأفضل الصنايعية والموردين المعتمدين في مصر. اطلب خدمتك واستلم عروض أسعار في لحظتها من مئات المتخصصين.",
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M8 3L3 8m0 0l5 5m-5-5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconShield = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconZap = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconUsers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconTruck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="1" y="3" width="15" height="13" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <path d="M16 8h4l3 3v5h-7V8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const IconBriefcase = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="12" y1="12" x2="12" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="8" y1="14.5" x2="16" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

// ─── Data ─────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "+500", label: "صنايعي ومورد معتمد" },
  { value: "12K", label: "طلب خلص بنجاح" },
  { value: "98%", label: "نسبة رضا العملاء" },
  { value: "<45m", label: "متوسط وقت أول رد" },
];

const STEPS = [
  {
    num: "01",
    title: "نزل طلبك/مشكلتك",
    desc: "اشرح اللي محتاجه، ضيف صور واضحة وحدد مكانك في أقل من دقيقة.",
  },
  {
    num: "02",
    title: "استلم العروض",
    desc: "هتجيلك عروض أسعار بتفاصيلها من أحسن الناس المتخصصة في طلبك.",
  },
  {
    num: "03",
    title: "اختار وادفع بأمان",
    desc: "قارن بين العروض، اختار الأنسب ليك، وادفع من خلال بوابة دفع آمنة واضمن حقك.",
  },
];

const SERVICES = [
  { Icon: IconZap, label: "كهرباء وسباكة" },
  { Icon: IconShield, label: "صيانة وتصليح" },
  { Icon: IconTruck, label: "نقل عفش وتخزين" },
  { Icon: IconBriefcase, label: "تشطيبات وديكور" },
  { Icon: IconUsers, label: "نضافة وخدمات بيت" },
  { Icon: IconZap, label: "تكنولوجيا وموبايلات" },
  { Icon: IconTruck, label: "توصيل وشحن" },
  { Icon: IconShield, label: "عربيات وميكانيكا" },
];

const FEATURES = [
  "عروض أسعار بتنافس بعضها في دقايق",
  "صنايعية وموردين متراجعين ومتقيمين",
  "دفع آمن وضمان استرجاع فلوسك",
  "تابع طلبك خطوة بخطوة",
  "خدمة عملاء معاك ٢٤ ساعة",
  "من غير أي رسوم على العميل",
];

export default function HomePage() {
  return (
    <main
      className="min-h-screen bg-white text-slate-900 antialiased"
      dir="rtl"
    >
      {/* ── NAV ────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-black text-white">
              ش
            </span>
            <span className="text-lg font-black tracking-tight text-slate-900">
              شوفلي
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 sm:block"
            >
              دخول
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-slate-700"
            >
              افتح حساب ببلاش
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-5 pb-24 pt-20 lg:pb-32 lg:pt-32 lg:px-8">
        {/* Subtle dot grid */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle, #e2e8f0 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            opacity: 0.5,
          }}
        />
        {/* Warm glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/6 blur-[100px]" />

        <div className="relative mx-auto max-w-4xl">
          {/* Eyebrow */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-500 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            الخدمة شغالة دلوقتي في مصر
          </div>

          {/* Headline */}
          <h1 className="mb-5 text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            اطلب الخدمة اللي محتاجها
            <br />
            <span className="text-primary">واستلم أحسن الأسعار</span>
            <br />
            في دقايق وبكل سهولة
          </h1>

          <p className="mb-10 max-w-xl text-base leading-relaxed text-slate-500 lg:text-lg">
            شوفلي بتربطك بأكتر من ٥٠٠ مورد وصنايعي معتمد. نزل طلبك دلوقتي من غير ولا قرش، 
            استلم عروض أسعار تنافسية، وادفع بأمان تام — وكل ده من غير أي وسيط.
          </p>

          {/* CTA Row */}
          <div className="mb-14 flex flex-wrap items-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-orange-600 hover:shadow-xl hover:shadow-primary/30"
            >
              افتح حساب ببلاش
              <span className="rotate-180">
                <IconArrow />
              </span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-sm font-bold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              عندي حساب
            </Link>
          </div>

          {/* Trust bar */}
          <div className="flex flex-wrap items-center gap-5 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="flex shrink-0 items-center gap-0.5 text-amber-400">
                {[...Array(5)].map((_, i) => <IconStar key={i} />)}
              </span>
              <span className="font-semibold text-slate-600">٤.٩</span>
              <span>من ٢٬٤٠٠+ تقييم</span>
            </span>
            <span className="hidden h-4 w-px bg-slate-200 sm:block" />
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-500"><IconCheck /></span>
              من غير أي رسوم اشتراك
            </span>
            <span className="hidden h-4 w-px bg-slate-200 sm:block" />
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-500"><IconCheck /></span>
              ضمان استرجاع لفلوسك
            </span>
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────────────────────── */}
      <section className="border-y border-slate-100 bg-slate-50/70 px-5 py-14 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="mb-1 text-3xl font-black tracking-tight text-slate-900 lg:text-4xl">
                  {s.value}
                </p>
                <p className="text-xs font-medium leading-relaxed text-slate-500 lg:text-sm">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
      <section className="px-5 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-16 text-center">
            <span className="mb-3 inline-block text-xs font-bold uppercase tracking-widest text-primary">
              ازاى بنشتغل
            </span>
            <h2 className="mb-4 text-3xl font-black tracking-tight text-slate-900 lg:text-4xl">
              من الطلب لحد التنفيذ في ٣ خطوات بصّل
            </h2>
            <p className="mx-auto max-w-lg text-slate-500">
              خطوات بسيطة عشان نوفر وقتك وتضمن إنك هتاخد أحسن خدمة بأحسن سعر في السوق.
            </p>
          </div>

          {/* Steps */}
          <div className="relative grid gap-6 lg:grid-cols-3">
            {/* Connector line — desktop only */}
            <div className="absolute right-[calc(16.67%+1.5rem)] top-10 hidden h-px w-[calc(66.67%-3rem)] border-t border-dashed border-slate-300 lg:block" />

            {STEPS.map((step, i) => (
              <div
                key={i}
                className="relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-primary/25 hover:shadow-md"
              >
                {/* Step number badge */}
                <div className="mb-6 flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-black text-primary ring-4 ring-primary/5">
                    {i + 1}
                  </span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>

                {/* Icon */}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
                  {i === 0 && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  )}
                  {i === 1 && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      <line x1="9" y1="10" x2="15" y2="10" />
                      <line x1="12" y1="7" x2="12" y2="13" />
                    </svg>
                  )}
                  {i === 2 && (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                  )}
                </div>

                <h3 className="mb-2.5 text-base font-bold text-slate-900">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES + SERVICES ────────────────────────────────────────────── */}
      <section className="bg-slate-900 px-5 py-24 text-white lg:px-8 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
            {/* Left: Feature list */}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
                ليه تختار شوفلي؟
              </p>
              <h2 className="mb-6 text-3xl font-black tracking-tight text-white lg:text-4xl">
                منصة معمولة عشان الثقة والشفافية
              </h2>
              <p className="mb-10 text-sm leading-relaxed text-slate-400">
                عملنا شوفلي عشان نخلي تعاملك مع الصنايعية والموردين تجربة سهلة، واضحة،
                ومضمونة من كل ناحية بدون وجع دماغ.
              </p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <IconCheck />
                    </span>
                    <span className="text-sm font-medium text-slate-300">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Services grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {SERVICES.map(({ Icon, label }) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/8 bg-white/5 p-4 text-center transition-colors hover:border-white/15 hover:bg-white/8"
                >
                  <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-slate-300">
                    <Icon />
                  </div>
                  <p className="text-xs font-medium leading-tight text-slate-400">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PORTALS ────────────────────────────────────────────────────────── */}
      <section className="px-5 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
              بوابات الدخول
            </p>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 lg:text-4xl">
              حساب لكل دور
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Client */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-7 transition-shadow hover:shadow-md hover:border-slate-300">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition-colors group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:text-primary">
                <IconUsers />
              </div>
              <h3 className="mb-2 text-base font-bold text-slate-900">
                حساب العميل
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-slate-500">
                نزل طلبك، استلم العروض، وادفع بأمان. تجربة سهلة من البداية للنهاية عشان تخلّص مصلحتك بسرعه.
              </p>
              <Link
                href="/client"
                className="inline-flex items-center gap-2 text-sm font-bold text-primary transition-gap hover:gap-3"
              >
                دخول كعميل
                <span className="rotate-180 transition-transform group-hover:-translate-x-1">
                  <IconArrow />
                </span>
              </Link>
            </div>

            {/* Vendor */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-7 transition-shadow hover:shadow-md hover:border-slate-300">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition-colors group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:text-primary">
                <IconBriefcase />
              </div>
              <h3 className="mb-2 text-base font-bold text-slate-900">
                حساب المورد والصنايعي
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-slate-500">
                قدم عروضك للطلبات اللي تناسبك، تابع أرباحك، وابني سمعة قوية واسم كبير على المنصة.
              </p>
              <Link
                href="/vendor"
                className="inline-flex items-center gap-2 text-sm font-bold text-primary transition-gap hover:gap-3"
              >
                دخول كمورد
                <span className="rotate-180 transition-transform group-hover:-translate-x-1">
                  <IconArrow />
                </span>
              </Link>
            </div>

            {/* Delivery */}
            <div className="group rounded-2xl border border-slate-200 bg-white p-7 transition-shadow hover:shadow-md hover:border-slate-300">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition-colors group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:text-primary">
                <IconTruck />
              </div>
              <h3 className="mb-2 text-base font-bold text-slate-900">
                حساب التوصيل
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-slate-500">
                استلم مشاوير التوصيل، تابع الطلبات على الخريطة، وزود دخلك كل يوم بشغلك الحر.
              </p>
              <Link
                href="/delivery"
                className="inline-flex items-center gap-2 text-sm font-bold text-primary transition-gap hover:gap-3"
              >
                دخول كمندوب
                <span className="rotate-180 transition-transform group-hover:-translate-x-1">
                  <IconArrow />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="border-t border-slate-100 px-5 py-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-black tracking-tight text-slate-900 lg:text-4xl">
            جاهز تجرب شوفلي؟
          </h2>
          <p className="mb-10 text-base leading-relaxed text-slate-500">
            اعمل حساب مجاني ونزل أول طلب ليك في أقل من دقيقة. مئات الصنايعية
            والموردين المعتمدين مستنيينك عشان يخدموك.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-orange-600 hover:shadow-xl"
            >
              افتح حساب دلوقتي
              <span className="rotate-180">
                <IconArrow />
              </span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
            >
              عندي حساب
            </Link>
          </div>
          <p className="mt-6 text-xs text-slate-400">
            من غير ما تدخل فيزا · من غير رسوم اشتراك · تقدر تلغي حسابك في أي وقت
          </p>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 px-5 py-8 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-black text-white">
              ش
            </span>
            <span className="text-sm font-black text-slate-700">شوفلي</span>
          </div>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} شوفلي — جميع الحقوق محفوظة
          </p>
          <div className="flex items-center gap-6 text-xs font-semibold text-slate-500">
            <Link href="/login" className="transition-colors hover:text-slate-800">
              دخول
            </Link>
            <Link href="/register" className="transition-colors hover:text-slate-800">
              حساب جديد
            </Link>
            <Link href="/admin" className="transition-colors hover:text-slate-800">
              لوحة الإدارة
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
