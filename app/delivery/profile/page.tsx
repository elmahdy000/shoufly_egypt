"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/shoofly/button";
import { logoutUser } from "@/lib/api/auth";
import { 
  FiUser, 
  FiArrowLeft, 
  FiTruck, 
  FiLogOut,
  FiPackage,
  FiMap,
  FiStar
} from "react-icons/fi";

export default function DeliveryProfilePage() {
  const router = useRouter();

  async function handleLogout() {
    await logoutUser();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 lg:pb-10 font-sans dir-rtl text-right">
      {/* Page Header */}
      <div className="bg-white border-b border-[#E7E7E7]">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-6">
          <div className="flex items-center gap-3">
            <Link 
              href="/delivery" 
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
            >
              <FiArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-[#0F1111]">حسابي</h1>
              <p className="text-sm text-[#565959] font-medium mt-0.5">إدارة حساب مندوب التوصيل</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-8 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-[#E7E7E7] shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <FiUser size={28} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#0F1111]">مندوب توصيل</h2>
              <p className="text-sm text-[#565959]">أنت مسجل دخول كمندوب توصيل</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-[#E7E7E7] p-4 text-center">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 mx-auto mb-2">
              <FiPackage size={20} />
            </div>
            <p className="text-lg font-bold text-[#0F1111]">0</p>
            <p className="text-xs text-[#565959]">تم التوصيل</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E7E7E7] p-4 text-center">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mx-auto mb-2">
              <FiTruck size={20} />
            </div>
            <p className="text-lg font-bold text-[#0F1111]">0</p>
            <p className="text-xs text-[#565959]">قيد التوصيل</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E7E7E7] p-4 text-center">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 mx-auto mb-2">
              <FiStar size={20} />
            </div>
            <p className="text-lg font-bold text-[#0F1111]">5.0</p>
            <p className="text-xs text-[#565959]">التقييم</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl border border-[#E7E7E7] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#E7E7E7]">
            <h2 className="text-base font-bold text-[#0F1111]">الروابط السريعة</h2>
          </div>
          <div className="divide-y divide-[#E7E7E7]">
            <Link href="/delivery" className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors group">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <FiTruck size={18} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-[#0F1111]">توصيلاتي</p>
                <p className="text-xs text-[#565959]">الصفحة الرئيسية</p>
              </div>
              <FiArrowLeft size={16} className="text-slate-300 group-hover:text-indigo-600" />
            </Link>
            <Link href="/delivery/tasks" className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors group">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <FiMap size={18} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-[#0F1111]">طلبات التوصيل</p>
                <p className="text-xs text-[#565959]">الطلبات المتاحة والحالية</p>
              </div>
              <FiArrowLeft size={16} className="text-slate-300 group-hover:text-amber-600" />
            </Link>
          </div>
        </div>

        {/* Logout Card */}
        <div className="bg-white rounded-2xl border border-[#E7E7E7] shadow-sm p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 shrink-0">
              <FiLogOut size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#0F1111]">تسجيل الخروج</h3>
              <p className="text-xs text-[#565959] mt-1">اخرج من حسابك بشكل آمن</p>
            </div>
          </div>
          <Button variant="danger" onClick={handleLogout} className="w-full gap-2">
            <FiLogOut size={16} /> تسجيل الخروج
          </Button>
        </div>

        {/* App Info */}
        <div className="text-center py-4">
          <p className="text-xs text-[#767684]">شوفلاي - نظام توصيل ذكي</p>
          <p className="text-xs text-[#767684] mt-1">الإصدار 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
