"use client";

import { useState } from "react";
import { FiSettings, FiSliders, FiDollarSign, FiNavigation, FiShield, FiSave, FiAlertTriangle, FiCheckCircle, FiZap, FiTrash2 } from "react-icons/fi";
import { Button } from "@/components/shoofly/button";

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [commission, setCommission] = useState(15);
  const [vat, setVat] = useState(14);
  const [radius, setRadius] = useState(50);
  const [minOrder, setMinOrder] = useState(100);

  async function handleSave() {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commission, vat, radius, minOrder })
      });
      if (!response.ok) throw new Error('Failed to save');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Save failed:', err);
      alert('فشل حفظ الإعدادات. حاول مرة أخرى.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="p-8 lg:p-12 max-w-[1600px] mx-auto space-y-8 dir-rtl text-right font-sans">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">الإعدادات</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">أدوات التحكم في الأرباح والعمولات.</p>
          </div>
        </div>

        {/* Financial Settings */}
        <section className="space-y-6">
           <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FiDollarSign className="text-primary" /> السياسات المالية
           </h2>
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900 block">عمولة المنصة (%)</label>
                    <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-slate-900">%</span>
                       <input 
                         type="number" 
                         value={commission}
                         onChange={(e) => setCommission(Number(e.target.value))}
                         className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-medium focus:border-primary focus:bg-white transition-all outline-none"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900 block">ضريبة القيمة المضافة (%)</label>
                    <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-slate-900">%</span>
                       <input 
                         type="number" 
                         value={vat}
                         onChange={(e) => setVat(Number(e.target.value))}
                         className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-medium focus:border-primary focus:bg-white transition-all outline-none"
                       />
                    </div>
                 </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-xl flex items-center justify-between">
                 <div>
                    <h4 className="font-bold text-slate-900">الصرف التلقائي للموردين</h4>
                    <p className="text-xs text-slate-400">تفعيل التحويل البنكي الفوري.</p>
                 </div>
                 <div className="w-12 h-6 bg-emerald-500 rounded-full relative p-1">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
                 </div>
              </div>
           </div>
        </section>

        {/* Operational Settings */}
        <section className="space-y-6">
           <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FiNavigation className="text-primary" /> نطاق العمليات
           </h2>
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900 block">نطاق التغطية (كم)</label>
                    <input 
                      type="number" 
                      value={radius}
                      onChange={(e) => setRadius(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-medium focus:border-primary focus:bg-white transition-all outline-none"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900 block">الحد الأدنى للطلب (ج.م)</label>
                    <input 
                      type="number" 
                      value={minOrder}
                      onChange={(e) => setMinOrder(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-medium focus:border-primary focus:bg-white transition-all outline-none"
                    />
                 </div>
              </div>
           </div>
        </section>

        {/* Security Settings */}
        <section className="space-y-6">
           <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FiShield className="text-emerald-500" /> بروتوكولات الأمان
           </h2>

           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
              <div className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors cursor-pointer">
                 <div className="space-y-1">
                    <h4 className="font-bold text-slate-900">إلزام توثيق الهوية</h4>
                    <p className="text-xs text-slate-400">يجب على الموردين رفع وثائق رسمية قبل استقبال أي طلب.</p>
                 </div>
                 <div className="w-10 h-5 bg-emerald-500 rounded-full relative p-1">
                    <div className="w-3 h-3 bg-white rounded-full absolute right-1 top-1" />
                 </div>
              </div>
              
              <div className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors cursor-pointer">
                 <div className="space-y-1">
                    <h4 className="font-bold text-slate-900">نظام التسليم بكود التحقق (OTP)</h4>
                    <p className="text-xs text-slate-400">لا يمكن إغلاق الطلب إلا بإدخال كود من العميل.</p>
                 </div>
                 <div className="w-10 h-5 bg-emerald-500 rounded-full relative p-1">
                    <div className="w-3 h-3 bg-white rounded-full absolute right-1 top-1" />
                 </div>
              </div>
           </div>
        </section>

        {/* Save Button */}
        <div className="flex gap-4">
           <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 h-14 bg-slate-900 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2"
           >
              {isSaving ? 'جاري الحفظ...' : success ? <><FiCheckCircle /> تم التحديث</> : <><FiSave /> حفظ الإعدادات</>}
           </Button>
        </div>

        <div className="p-6 bg-amber-50 text-amber-800 rounded-2xl border border-amber-200 flex items-start gap-4">
           <FiAlertTriangle className="shrink-0 mt-1" size={20} />
           <p className="text-sm">
             تعديل العمولات يؤثر فقط على العمليات الجديدة.
           </p>
        </div>
    </div>
  );
}
