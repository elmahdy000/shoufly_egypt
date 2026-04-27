import { AppHeader } from "@/components/layout/app-header";
import { PageShell } from "@/components/layout/page-shell";
import { VendorNav } from "@/components/navigation/vendor-nav";
import { getCurrentUserFromCookie } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PendingApproval } from "@/components/shoofly/pending-approval";

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUserFromCookie();

  if (!user) {
    redirect("/login?callbackUrl=/vendor");
  }

  if (user.role !== "VENDOR") {
    if (user.role === "CLIENT") redirect("/client");
    if (user.role === "DELIVERY") redirect("/delivery");
    if (user.role === "ADMIN") redirect("/admin");
    redirect("/");
  }

  // Check if vendor account is activated by admin
  if (!user.isActive) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <AppHeader title="تطبيق المورد" subtitle="بانتظار التفعيل" />
        <PendingApproval role="VENDOR" />
      </div>
    );
  }

  return (
    <div>
      <AppHeader title="تطبيق المورد" subtitle="إدارة العروض والأرباح" />
      <PageShell>{children}</PageShell>
      <VendorNav />
    </div>
  );
}
