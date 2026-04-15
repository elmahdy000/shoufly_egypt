"use client";

import { useState } from "react";
import {
  Settings, DollarSign, Navigation, Shield, Save,
  AlertTriangle, CheckCircle, Loader2
} from "lucide-react";

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [commission, setCommission] = useState(15);
  const [vat, setVat] = useState(14);
  const [radius, setRadius] = useState(50);
  const [minOrder, setMinOrder] = useState(100);
  const [autoPayout, setAutoPayout] = useState(true);
  const [verifyRequired, setVerifyRequired] = useState(true);
  const [otpDelivery, setOtpDelivery] = useState(true);

  async function handleSave() {
    setIsSaving(true);
    try {
      // Get CSRF token for state-changing request
      const getCsrfToken = () => {
        const match = document.cookie.match(/(^| )csrf_token=([^;]+)/);
        return match ? match[2] : null;
      };
      
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-csrf-token': getCsrfToken() || ''
        },
        credentials: 'include',
        body: JSON.stringify({ commission, vat, radius, minOrder, autoPayout, verifyRequired, otpDelivery })
      });
      if (!response.ok) throw new Error('Failed to save');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="admin-page" dir="rtl">
      
      {/* 🚀 Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 leading-tight">إعدادات المنصة</h1>
           <p className="text-slate-500 font-medium mt-1">تخصيص القواعد التشغيلية والسياسات المالية للنظام</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
         
         <div className="lg:col-span-2 space-y-8">
            
            {/* 💰 Financial Configuration */}
            <section className="glass-card overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600"><DollarSign size={20} /></div>
                  <h2 className="text-lg font-bold text-slate-900">السياسات المالية</h2>
               </div>
               <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 tracking-wide mr-2">عمولة المنصة (%)</label>
                        <div className="relative">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black">%</span>
                           <input
                             type="number"
                             value={commission}
                             onChange={(e) => setCommission(Number(e.target.value))}
                             className="w-full pr-4 pl-10 h-11 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-1 focus:ring-primary outline-none transition-all font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                           />
                        </div>
                        <p className="text-xs text-slate-500 mr-2">النسبة المقتطعة من إجمالي قيمة الطلب</p>
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 tracking-wide mr-2">ضريبة القيمة المضافة (%)</label>
                        <div className="relative">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black">%</span>
                           <input
                             type="number"
                             value={vat}
                             onChange={(e) => setVat(Number(e.target.value))}
                             className="w-full pr-4 pl-10 h-11 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-1 focus:ring-primary outline-none transition-all font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                           />
                        </div>
                        <p className="text-xs text-slate-500 mr-2">الضريبة المفروضة طبقاً للوائح المحلية</p>
                     </div>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-2xl flex items-center justify-between gap-4 border border-slate-100/50">
                     <div>
                        <h4 className="text-xs font-bold text-slate-900">التسوية التلقائية للموردين</h4>
                        <p className="text-xs text-slate-500 mt-1">جدولة تحويل الأرصدة آلياً بعد اكتمال الدورة المالية</p>
                     </div>
                     <button
                       onClick={() => setAutoPayout(!autoPayout)}
                       className={`w-12 h-6 rounded-full transition-all relative ${autoPayout ? 'bg-primary' : 'bg-slate-200'}`}
                     >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${autoPayout ? 'right-1' : 'left-1'}`} />
                     </button>
                  </div>
               </div>
            </section>

            {/* Operational Metrics */}
            <section className="glass-card overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600"><Navigation size={20} /></div>
                  <h2 className="text-lg font-bold text-slate-900">نطاق العمليات</h2>
               </div>
               <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <label className="text-xs font-black text-slate-500 tracking-wide mr-2">قطر التغطية (كم)</label>
                     <input
                       type="number"
                       value={radius}
                       onChange={(e) => setRadius(Number(e.target.value))}
                       className="w-full px-4 h-11 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-1 focus:ring-primary outline-none transition-all font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                     />
                     <p className="text-xs text-slate-500 mr-2">أقصى مسافة للربط بين العميل والمندوب</p>
                  </div>
                  <div className="space-y-2">
                     <label className="text-xs font-black text-slate-500 tracking-wide mr-2">الحد الأدنى للطلب (ج.م)</label>
                     <input
                       type="number"
                       value={minOrder}
                       onChange={(e) => setMinOrder(Number(e.target.value))}
                       className="w-full px-4 h-11 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-1 focus:ring-primary outline-none transition-all font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                     />
                     <p className="text-xs text-slate-500 mr-2">أقل قيمة مسموح بها لإنشاء طلب جديد</p>
                  </div>
               </div>
            </section>

            {/* Guardrail Settings */}
            <section className="glass-card overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600"><Shield size={20} /></div>
                  <h2 className="text-lg font-bold text-slate-900">بروتوكولات الأمان</h2>
               </div>
               <div className="p-0">
                  <SettingToggle 
                    title="توثيق الهوية الإلزامي" 
                    desc="يتطلب من المورد رفع وثائق رسمية مفعلة قبل بدء العمل" 
                    active={verifyRequired} 
                    onToggle={() => setVerifyRequired(!verifyRequired)} 
                  />
                  <SettingToggle 
                    title="رمز التأكيد عند التسليم (OTP)" 
                    desc="يرسل كود تحقق لهاتف العميل لا يمكن استكمال الطلب بدونه" 
                    active={otpDelivery} 
                    onToggle={() => setOtpDelivery(!otpDelivery)} 
                    last
                  />
               </div>
            </section>

            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-4">
               <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
               <p className="text-sm font-bold text-amber-800 leading-relaxed">
                  ملاحظة هامة: القواعد والنسب المالية الجديدة تسري فقط على العمليات التي تتم بعد لحظة الحفظ. العمليات الجارية حالياً تحتفظ بخصائصها القديمة لضمان الثبات المالي.
               </p>
            </div>
         </div>

         {/* 💾 Control Sidebar */}
         <div className="space-y-6 sticky top-24">
            <div className="glass-card p-8 space-y-6">
               <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-4">ملخص الإعدادات</h3>
               <div className="space-y-4">
                  <SummaryRow label="العمولة" val={`${commission}%`} />
                  <SummaryRow label="الضريبة" val={`${vat}%`} />
                  <SummaryRow label="نطاق التغطية" val={`${radius} كم`} />
                  <SummaryRow label="الأدنى للطلب" val={`${minOrder} ج.م`} />
               </div>
               
               <div className="pt-4">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full h-12 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                     {isSaving ? <Loader2 size={16} className="animate-spin" /> : success ? <CheckCircle size={16} /> : <Save size={16} />}
                     {isSaving ? "جاري الحفظ..." : success ? "تم الحفظ بنجاح" : "حفظ التغييرات"}
                  </button>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}

function SettingToggle({ title, desc, active, onToggle, last }: { title: string; desc: string; active: boolean; onToggle: () => void; last?: boolean }) {
  return (
    <div className={`p-8 flex items-center justify-between gap-6 hover:bg-slate-50 transition-colors ${!last ? 'border-b border-slate-100' : ''}`}>
       <div>
          <h4 className="text-sm font-bold text-slate-900">{title}</h4>
          <p className="text-xs text-slate-500 mt-1">{desc}</p>
       </div>
       <button
         onClick={onToggle}
         className={`w-12 h-6 rounded-full transition-all relative shrink-0 ${active ? 'bg-primary' : 'bg-slate-200'}`}
       >
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${active ? 'right-1' : 'left-1'}`} />
       </button>
    </div>
  );
}

function SummaryRow({ label, val }: { label: string; val: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
       <span className="font-bold text-slate-500 tracking-wide">{label}</span>
       <span className="font-black text-slate-900 tabular-nums">{val}</span>
    </div>
  );
}
