import { AppHeader } from "@/components/layout/app-header";
import { PageShell } from "@/components/layout/page-shell";
import { DeliveryNav } from "@/components/navigation/delivery-nav";
import { getCurrentUserFromCookie } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PendingApproval } from "@/components/shoofly/pending-approval";

export default async function DeliveryLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUserFromCookie();

  if (!user) {
    redirect("/login?callbackUrl=/delivery");
  }

  if (user.role !== "DELIVERY") {
    if (user.role === "CLIENT") redirect("/client");
    if (user.role === "VENDOR") redirect("/vendor");
    if (user.role === "ADMIN") redirect("/admin");
    redirect("/");
  }

  // Check if delivery agent account is activated by admin
  if (!user.isActive) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <AppHeader title="تطبيق المندوب" subtitle="بانتظار التفعيل" />
        <PendingApproval role="DELIVERY" />
      </div>
    );
  }

  return (
    <div>
      <AppHeader title="تطبيق المندوب" subtitle="إدارة المهام" />
      <PageShell>{children}</PageShell>
      <DeliveryNav />
    </div>
  );
}
