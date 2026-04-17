"use client";

import { useState } from "react";
import { DollarSign, Navigation, Shield, Save, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving]               = useState(false);
  const [success, setSuccess]                 = useState(false);
  const [commission, setCommission]           = useState(15);
  const [vat, setVat]                         = useState(14);
  const [radius, setRadius]                   = useState(50);
  const [minOrder, setMinOrder]               = useState(100);
  const [autoPayout, setAutoPayout]           = useState(true);
  const [verifyRequired, setVerifyRequired]   = useState(true);
  const [otpDelivery, setOtpDelivery]         = useState(true);

  async function handleSave() {
    setIsSaving(true);
    try {
      const getCsrfToken = () => {
        const match = document.cookie.match(/(^| )csrf_token=([^;]+)/);
        return match ? match[2] : null;
      };
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": getCsrfToken() || "" },
        credentials: "include",
        body: JSON.stringify({ commission, vat, radius, minOrder, autoPayout, verifyRequired, otpDelivery }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      /* handled below */
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إعدادات المنصة</h1>
        <p className="text-sm text-gray-500 mt-1">تخصيص القواعد التشغيلية والسياسات المالية للنظام</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Settings Sections */}
        <div className="lg:col-span-2 space-y-5">

          {/* Financial */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                <DollarSign size={16} />
              </div>
              <h2 className="text-base font-semibold text-gray-900">السياسات المالية</h2>
            </div>
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">عمولة المنصة (%)</label>
                  <input
                    type="number"
                    value={commission}
                    onChange={e => setCommission(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">النسبة المقتطعة من قيمة الطلب</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">ضريبة القيمة المضافة (%)</label>
                  <input
                    type="number"
                    value={vat}
                    onChange={e => setVat(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <p className="text-xs text-gray-400 mt-1.5">الضريبة طبقاً للوائح المحلية</p>
                </div>
              </div>
              <Toggle
                title="التسوية التلقائية للموردين"
                desc="جدولة تحويل الأرصدة آلياً بعد اكتمال الدورة المالية"
                active={autoPayout}
                onToggle={() => setAutoPayout(v => !v)}
              />
            </div>
          </div>

          {/* Operations */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                <Navigation size={16} />
              </div>
              <h2 className="text-base font-semibold text-gray-900">نطاق العمليات</h2>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">قطر التغطية (كم)</label>
                <input
                  type="number"
                  value={radius}
                  onChange={e => setRadius(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <p className="text-xs text-gray-400 mt-1.5">أقصى مسافة للربط بين العميل والمندوب</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">الحد الأدنى للطلب (ج.م)</label>
                <input
                  type="number"
                  value={minOrder}
                  onChange={e => setMinOrder(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <p className="text-xs text-gray-400 mt-1.5">أقل قيمة لإنشاء طلب جديد</p>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Shield size={16} />
              </div>
              <h2 className="text-base font-semibold text-gray-900">بروتوكولات الأمان</h2>
            </div>
            <div className="divide-y divide-gray-100">
              <Toggle
                title="توثيق الهوية الإلزامي"
                desc="يتطلب من المورد رفع وثائق رسمية قبل بدء العمل"
                active={verifyRequired}
                onToggle={() => setVerifyRequired(v => !v)}
                padded
              />
              <Toggle
                title="رمز التأكيد عند التسليم (OTP)"
                desc="يرسل كود تحقق لهاتف العميل لإتمام التسليم"
                active={otpDelivery}
                onToggle={() => setOtpDelivery(v => !v)}
                padded
              />
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              القواعد الجديدة تسري فقط على العمليات التي تتم بعد لحظة الحفظ. العمليات الجارية تحتفظ بخصائصها القديمة.
            </p>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:sticky lg:top-24 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">ملخص الإعدادات</h3>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: "العمولة",       value: `${commission}%`  },
                { label: "الضريبة",       value: `${vat}%`         },
                { label: "نطاق التغطية",  value: `${radius} كم`    },
                { label: "الأدنى للطلب", value: `${minOrder} ج.م` },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className="text-sm font-bold text-gray-900 tabular-nums">{value}</span>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`w-full py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  success
                    ? "bg-green-600 text-white"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                } disabled:opacity-50`}
              >
                {isSaving  ? <><Loader2 size={15} className="animate-spin" /> جاري الحفظ...</> :
                 success   ? <><CheckCircle size={15} /> تم الحفظ</> :
                             <><Save size={15} /> حفظ التغييرات</>}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function Toggle({ title, desc, active, onToggle, padded }: {
  title: string; desc: string; active: boolean; onToggle: () => void; padded?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-6 ${padded ? "px-5 py-4" : ""}`}>
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${active ? "bg-orange-500" : "bg-gray-300"}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${active ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}
