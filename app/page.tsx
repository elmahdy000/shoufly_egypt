import Link from "next/link";
import { StatCard } from "@/components/shoofly/stat-card";
import { Button } from "@/components/shoofly/button";
import { StatusBadge } from "@/components/shoofly/status-badge";
import { FiBox, FiBriefcase, FiDollarSign, FiUser, FiShoppingBag, FiSettings, FiTruck } from "react-icons/fi";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32">
        <div className="absolute top-0 right-1/2 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="mx-auto max-w-5xl relative">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-6">
            <span className="relative flex h-2 w-2 ml-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            النظام الموحد الذكي
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
            منصة <span className="text-primary">Shoofly</span> <br /> 
            للخدمات اللوجستية المتكاملة
          </h1>
          
          <p className="max-w-2xl text-lg text-muted leading-relaxed mb-10">
            اختبر الجيل القادم من إدارة الخدمات والتوصيل. قوة في الأداء، بساطة في الاستخدام، وشفافية مطلقة في كل معاملة.
          </p>

          <div className="flex flex-wrap gap-4 mb-20">
            <Link href="/register">
              <Button size="lg">ابدأ الآن مجاناً</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">تسجيل الدخول</Button>
            </Link>
          </div>

          {/* Quick Stats Showcase */}
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
            <StatCard 
              title="إجمالي الطلبات" 
              value="12,482" 
              trend={{ value: "+12%", isUp: true }}
              icon={<FiBox className="text-primary" />}
            />
            <StatCard 
              title="تجار نشطين" 
              value="842" 
              trend={{ value: "+5%", isUp: true }}
              icon={<FiBriefcase className="text-primary" />}
            />
            <StatCard 
              title="إجمالي الأرباح" 
              value="450k" 
              trend={{ value: "+8%", isUp: true }}
              icon={<FiDollarSign className="text-primary" />}
            />
            <div className="shoofly-card p-6 flex flex-col justify-center items-center bg-primary text-white">
              <p className="text-sm opacity-80 mb-1">حالة النظام</p>
              <div className="flex items-center gap-2">
                <StatusBadge status="completed" label="يعمل بكفاءة" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Access Portals */}
      <section className="bg-white/50 border-t border-border py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold mb-10">بوابات الدخول السريع</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'تطبيق العميل', icon: <FiUser />, href: '/client', desc: 'اطلب خدماتك بكل سهولة' },
              { title: 'بوابة التاجر', icon: <FiShoppingBag />, href: '/vendor', desc: 'إدارة العروض والأرباح' },
              { title: 'لوحة الإدارة', icon: <FiSettings />, href: '/admin', desc: 'تحكم كامل في النظام' },
              { title: 'تطبيق المندوب', icon: <FiTruck />, href: '/delivery', desc: 'تسليم الطلبات وتتبعها' },
            ].map((portal) => (
              <Link key={portal.href} href={portal.href} className="shoofly-card p-6 hover:border-primary group">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-xl text-primary mb-4 group-hover:scale-110 transition-transform">
                  {portal.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{portal.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{portal.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
