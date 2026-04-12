import { AppHeader } from "@/components/layout/app-header";
import { PageShell } from "@/components/layout/page-shell";
import { ClientNav } from "@/components/navigation/client-nav";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <AppHeader title="تطبيق العميل" subtitle="تجربة جوال أولاً" />
      <PageShell>{children}</PageShell>
      <ClientNav />
    </div>
  );
}
