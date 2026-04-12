import { AppHeader } from "@/components/layout/app-header";
import { PageShell } from "@/components/layout/page-shell";
import { DeliveryNav } from "@/components/navigation/delivery-nav";

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <AppHeader title="تطبيق التوصيل" subtitle="مهام التوصيل والاستلام" />
      <PageShell>{children}</PageShell>
      <DeliveryNav />
    </div>
  );
}
