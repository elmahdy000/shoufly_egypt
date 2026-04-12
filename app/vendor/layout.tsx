import { AppHeader } from "@/components/layout/app-header";
import { PageShell } from "@/components/layout/page-shell";
import { VendorNav } from "@/components/navigation/vendor-nav";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <AppHeader title="تطبيق المورد" subtitle="إدارة العروض والأرباح" />
      <PageShell>{children}</PageShell>
      <VendorNav />
    </div>
  );
}
