import { getCurrentUserFromCookie } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminDashboardShell from "./AdminDashboardShell";
import { AlertCircle } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUserFromCookie();

  if (!user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (user.role !== "ADMIN") {
    if (user.role === "CLIENT") redirect("/client");
    if (user.role === "VENDOR") redirect("/vendor");
    if (user.role === "DELIVERY") redirect("/delivery");
    redirect("/");
  }

  // Handle deactivated admin accounts (super-admin safety)
  if (!user.isActive) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white" dir="rtl">
        <div className="max-w-md w-full bg-slate-800 rounded-3xl p-8 shadow-2xl text-center border border-slate-700">
          <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-xl font-bold mb-2 font-tajawal">صلاحية المسؤول معطلة</h2>
          <p className="text-slate-400 mb-6 font-tajawal">
            عذراً، يبدو أن صلاحيات دخولك كمسؤول قد تم إيقافها من قبل الإدارة المركزية.
          </p>
          <a 
            href="/logout" 
            className="block w-full py-3 bg-white text-slate-900 rounded-xl font-bold font-tajawal"
          >
            تسجيل الخروج
          </a>
        </div>
      </div>
    );
  }

  return <AdminDashboardShell>{children}</AdminDashboardShell>;
}
