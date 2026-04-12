"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shoofly/button";
import { logoutUser } from "@/lib/api/auth";
import { 
  FiUser, 
  FiSettings, 
  FiShield, 
  FiLogOut, 
  FiBell, 
  FiArrowRight,
  FiChevronLeft,
  FiPackage,
  FiMapPin,
  FiPhone,
  FiMail,
  FiEdit3
} from "react-icons/fi";

export default function ClientProfilePage() {
  const router = useRouter();

  async function handleLogout() {
    await logoutUser();
    document.cookie = 'session_token=; Max-Age=0; path=/';
    router.push("/login");
  }

  return (
    <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-8 font-sans dir-rtl text-right pb-24 lg:pb-10">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Link href="/client" className="text-sm text-slate-500 hover:text-primary flex items-center gap-1 mb-2">
            <FiArrowRight size={14} /> العودة للرئيسية
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FiUser className="text-primary" /> الملف الشخصي
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">إدارة حسابك وإعداداتك</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUser size={36} className="text-primary" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">أحمد محمد</h2>
            <p className="text-sm text-slate-500 mb-4">client@shoofly.com</p>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-full">
              <FiShield size={12} /> حساب نشط
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <FiPhone size={14} />
                </div>
                <span>+20 123 456 7890</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <FiMapPin size={14} />
                </div>
                <span className="truncate">القاهرة، مصر</span>
              </div>
            </div>

            <Button 
              variant="secondary" 
              className="w-full mt-6 h-11 text-sm font-medium"
            >
              <FiEdit3 size={16} className="ml-2" /> تعديل الملف الشخصي
            </Button>
          </div>
        </div>

        {/* Settings & Options */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Account Settings */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">إعدادات الحساب</h3>
            </div>
            
            <div className="divide-y divide-slate-100">
              <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                    <FiSettings size={18} />
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm text-slate-900">تغيير كلمة المرور</p>
                    <p className="text-xs text-slate-500">تحديث كلمة المرور الخاصة بك</p>
                  </div>
                </div>
                <FiChevronLeft className="text-slate-300" size={18} />
              </button>

              <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                    <FiMail size={18} />
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm text-slate-900">البريد الإلكتروني</p>
                    <p className="text-xs text-slate-500">client@shoofly.com</p>
                  </div>
                </div>
                <FiChevronLeft className="text-slate-300" size={18} />
              </button>

              <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                    <FiPhone size={18} />
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm text-slate-900">رقم الهاتف</p>
                    <p className="text-xs text-slate-500">+20 123 456 7890</p>
                  </div>
                </div>
                <FiChevronLeft className="text-slate-300" size={18} />
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">تفضيلات الإشعارات</h3>
            </div>
            
            <div className="divide-y divide-slate-100">
              <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                    <FiBell size={18} />
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm text-slate-900">إشعارات البريد</p>
                    <p className="text-xs text-slate-500">استلام إشعارات عبر البريد الإلكتروني</p>
                  </div>
                </div>
                <div className="w-11 h-6 bg-primary rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </button>

              <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                    <FiPackage size={18} />
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm text-slate-900">تحديثات الطلبات</p>
                    <p className="text-xs text-slate-500">إشعارات عند تحديث حالة الطلبات</p>
                  </div>
                </div>
                <div className="w-11 h-6 bg-primary rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </button>
            </div>
          </div>

          {/* Logout Button */}
          <Button 
            variant="secondary" 
            onClick={handleLogout} 
            className="w-full h-12 text-sm font-medium bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 rounded-xl"
          >
            <FiLogOut size={18} className="ml-2" /> تسجيل الخروج
          </Button>

        </div>
      </div>
    </div>
  );
}
