"use client";

import { motion } from "framer-motion";
import { Clock, ShieldCheck, UserCheck, AlertCircle } from "lucide-react";

interface PendingApprovalProps {
  role: "VENDOR" | "DELIVERY";
}

export function PendingApproval({ role }: PendingApprovalProps) {
  const isVendor = role === "VENDOR";

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden"
      >
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full" />

        <div className="relative z-10">
          <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-orange-600 animate-pulse" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-3 font-tajawal">
            حسابك قيد المراجعة
          </h2>
          
          <p className="text-slate-600 mb-8 leading-relaxed font-tajawal">
            أهلاً بك في عائلة شوف لي! {isVendor ? "بصفتك تاجر جديد" : "بصفتك كابتن توصيل"}، 
            نحن نقوم حالياً بمراجعة بياناتك لضمان جودة الخدمة. 
            سيتم تفعيل حسابك خلال 24 ساعة عمل.
          </p>

          <div className="space-y-4 text-right">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              <span className="text-sm text-slate-700 font-tajawal">يتم التأكد من صحة المستندات</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-slate-700 font-tajawal">يتم مطابقة البيانات الشخصية</span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-slate-700 font-tajawal">سنقوم بإخطارك فور التفعيل</span>
            </div>
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors font-tajawal shadow-lg shadow-slate-200"
          >
            تحديث الحالة
          </button>
        </div>
      </motion.div>
    </div>
  );
}
