"use client";

import { FormEvent, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shoofly/button";
import { ErrorState } from "@/components/shared/error-state";
import { createClientRequest } from "@/lib/api/requests";
import { 
  FiFileText, FiMapPin, FiPhone, FiGrid, FiList, 
  FiCheckCircle, FiImage, FiUploadCloud, FiTrash2, 
  FiMap, FiDollarSign, FiChevronLeft, FiChevronRight,
  FiZap, FiMap as FiMapIcon, FiActivity
} from "react-icons/fi";

const EGYPTIAN_CATEGORIES: Record<string, string[]> = {
  "خدمات منزلية": ["سباكة", "كهرباء", "نجارة", "نظافة عامة", "مكافحة حشرات"],
  "تكنولوجيا وهواتف": ["صيانة هواتف", "برمجة وصيانة حواسيب", "تركيب كاميرات مراقبة"],
  "نقل متحركات": ["نقل عفش", "ونش إنقاذ", "سيارات مغلقة"],
};

export default function NewRequestPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form State
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [parentCategory, setParentCategory] = useState("خدمات منزلية");
  const [subCategory, setSubCategory] = useState("سباكة");
  const [address, setAddress] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");
  const [images, setImages] = useState<File[]>([]);
  
  // Technical State
  const [latitude, setLatitude] = useState("30.0444"); // Cairo default
  const [longitude, setLongitude] = useState("31.2357"); // Cairo default
  const [categoryId, setCategoryId] = useState<number>(1);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [locStatus, setLocStatus] = useState<"idle" | "detecting" | "success" | "error">("idle");
  
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Helper to parse complex/zod errors
  const formatError = (err: any): string => {
    if (typeof err === "string") {
      try {
        const parsed = JSON.parse(err);
        if (Array.isArray(parsed) && parsed[0]?.message) {
          return `${parsed[0].path?.join(".") || "Error"}: ${parsed[0].message}`;
        }
      } catch {
        return err;
      }
    }
    return err?.message || String(err);
  };

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then((cats: any[]) => {
        setCategoryList(cats);
        if (cats?.length > 0) {
          const firstSub = cats[0]?.subcategories?.[0];
          if (firstSub?.id) setCategoryId(firstSub.id);
        }
      }).catch(() => {});
  }, []);

  const detectLocation = () => {
    setLocStatus("detecting");
    setError(null);
    if (!navigator.geolocation) {
      setLocStatus("error");
      setError("متصفحك لا يدعم خاصية تحديد الموقع.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(String(pos.coords.latitude));
        setLongitude(String(pos.coords.longitude));
        setLocStatus("success");
        setError(null);
      },
      () => {
        setLocStatus("error");
        setError("فشل تحديد الموقع. يرجى إدخال العنوان يدوياً.");
      },
      { timeout: 10000 }
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages(prev => [...prev, ...newFiles].slice(0, 4));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    if (step === 1 && (!title || !description)) {
      setError("برجاء ملء بيانات الطلب الأساسية.");
      return;
    }
    if (step === 3 && address.length < 5) {
      setError("برجاء إدخال عنوان تفصيلي صحيح (5 حروف على الأقل).");
      return;
    }
    if (step === 3 && !deliveryPhone) {
      setError("برجاء إدخال رقم الهاتف للتواصل.");
      return;
    }
    setError(null);
    setStep(prev => prev + 1);
  };

  const prevStep = () => setStep(prev => prev - 1);

  async function uploadImage(file: File): Promise<{filePath: string, fileName: string, mimeType: string, fileSize: number}> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`فشل رفع الصورة: ${file.name}`);
    }
    
    const result = await response.json();
    return {
      filePath: result.url,
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
    };
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      
      // رفع الصور الحقيقي
      let uploadedImages: {filePath: string, fileName: string, mimeType: string, fileSize: number}[] = [];
      if (images.length > 0) {
        uploadedImages = await Promise.all(images.map(file => uploadImage(file)));
      }

      const created = await createClientRequest({
        title,
        description: `[${subCategory}] ${description}`,
        budget: budget ? Number(budget) : undefined,
        address,
        latitude: Number(latitude),
        longitude: Number(longitude),
        deliveryPhone,
        notes: notes || undefined,
        categoryId: categoryId,
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
      });
      router.push(`/client/requests/${created.id}?new=true`);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSaving(false);
    }
  }

  const stepsList = [
    { title: "الخدمة", icon: <FiZap /> },
    { title: "الصور", icon: <FiImage /> },
    { title: "الموقع", icon: <FiMapIcon /> },
    { title: "التأكيد", icon: <FiCheckCircle /> },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8 pb-32 text-right dir-rtl">
      {/* 🚀 Header & Stepper */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <FiFileText size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">طلب جديد</h1>
            <p className="text-slate-500 text-xs">أكمل الخطوات البسيطة لنشر طلبك في السوق.</p>
          </div>
        </div>

        {/* Stepper UI */}
        <div className="flex items-center justify-between relative px-2">
           <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
           {stepsList.map((s, i) => {
             const num = i + 1;
             const isPassed = step > num;
             const isActive = step === num;
             return (
               <div key={i} className="relative z-10 flex flex-col items-center gap-2 group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                    isPassed ? "bg-emerald-500 border-white text-white rotate-[360deg]" : 
                    isActive ? "bg-white border-primary text-primary scale-110 shadow-lg" : 
                    "bg-white border-slate-100 text-slate-300"
                  }`}>
                    {isPassed ? <FiCheckCircle size={18} /> : s.icon}
                  </div>
                  <span className={`text-[10px] font-bold ${isActive ? "text-primary" : "text-slate-400"}`}>{s.title}</span>
               </div>
             )
           })}
        </div>
      </div>

      {error ? <ErrorState message={error} /> : null}

      <div className="min-h-[400px]">
        {/* Step 1: Details */}
        {step === 1 && (
          <div className="shoofly-card bg-white p-8 border-2 border-slate-100 animate-in fade-in slide-in-from-left-4 duration-500">
             <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 decoration-primary/30 underline underline-offset-8">
               <FiGrid size={20} className="text-primary" /> ما هي الخدمة المطلوبة؟
             </h2>
             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-xs font-black text-slate-400">عنوان الطلب</label>
                   <input 
                     value={title} onChange={(e) => setTitle(e.target.value)}
                     placeholder="مثال: تصليح خلاط مياه الحمام"
                     className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-primary outline-none transition-all"
                   />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                   <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400">الفئة الأساسية</label>
                      <select 
                        value={parentCategory} 
                        onChange={(e) => {
                          setParentCategory(e.target.value);
                          const firstSub = EGYPTIAN_CATEGORIES[e.target.value][0];
                          setSubCategory(firstSub);
                        }}
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-primary outline-none appearance-none"
                      >
                         {Object.keys(EGYPTIAN_CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400">التخصص الفرعي</label>
                      <select 
                        value={subCategory}
                        onChange={(e) => {
                          setSubCategory(e.target.value);
                          const found = categoryList.flatMap(c => c.subcategories || []).find(s => s.name === e.target.value);
                          if (found) setCategoryId(found.id);
                        }}
                        className="w-full px-5 py-4 bg-white border-2 border-primary/20 rounded-2xl text-sm font-bold text-primary outline-none"
                      >
                         {EGYPTIAN_CATEGORIES[parentCategory].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-black text-slate-400">اشرح المشكلة بالتفصيل</label>
                   <textarea 
                     value={description} onChange={(e) => setDescription(e.target.value)}
                     rows={4}
                     placeholder="اذكر كل التفاصيل اللي تساعد المورد يفهم طلبك..."
                     className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-primary outline-none resize-none"
                   />
                </div>
             </div>
          </div>
        )}

        {/* Step 2: Images */}
        {step === 2 && (
          <div className="shoofly-card bg-white p-8 border-2 border-indigo-100 animate-in fade-in slide-in-from-left-4 duration-500">
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-lg font-black text-indigo-900 flex items-center gap-2 underline decoration-indigo-200 underline-offset-8">
                 <FiImage size={20} className="text-indigo-500" /> صور الطلب
               </h2>
               <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">اختياري</span>
             </div>

             {images.length === 0 ? (
               <>
                 <div
                   onClick={() => fileInputRef.current?.click()}
                   className="border-4 border-dashed border-indigo-50 bg-indigo-50/30 hover:bg-indigo-50 rounded-[2rem] p-12 text-center cursor-pointer transition-all hover:scale-[1.01] group"
                 >
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-indigo-100 flex items-center justify-center mx-auto mb-6 group-hover:rotate-6 transition-transform">
                       <FiUploadCloud size={40} className="text-indigo-500" />
                    </div>
                    <h3 className="text-xl font-black text-indigo-950 mb-2">ارفع صور المشكلة</h3>
                    <p className="text-sm text-indigo-400 font-bold">كل ما الصور تكون أوضح، العروض هتكون أدق.</p>
                    <input
                      type="file" multiple accept="image/*" className="hidden"
                      ref={fileInputRef} onChange={handleImageUpload}
                    />
                 </div>

                 {/* Skip Option */}
                 <div className="mt-6 text-center">
                   <button
                     type="button"
                     onClick={() => setStep(3)}
                     className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors flex items-center gap-2 mx-auto"
                   >
                     <span>ليس لدي صور - تخطي هذه الخطوة</span>
                     <FiChevronLeft size={16} />
                   </button>
                   <p className="text-xs text-slate-300 mt-2">بعض الخدمات لا تحتاج صور مثل: استشارات، متابعة، إلخ</p>
                 </div>
               </>
             ) : (
               <>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((file, i) => (
                      <div key={i} className="aspect-square rounded-2xl border-2 border-slate-100 overflow-hidden relative group">
                         <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                         <button
                           type="button" onClick={() => removeImage(i)}
                           className="absolute inset-0 bg-rose-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                         >
                           <FiTrash2 size={24} />
                         </button>
                      </div>
                    ))}
                 </div>
                 <button
                   type="button"
                   onClick={() => fileInputRef.current?.click()}
                   className="mt-4 w-full py-3 border-2 border-dashed border-indigo-200 rounded-xl text-indigo-500 font-medium hover:bg-indigo-50 transition-colors"
                 >
                   + إضافة المزيد من الصور
                 </button>
                 <input
                   type="file" multiple accept="image/*" className="hidden"
                   ref={fileInputRef} onChange={handleImageUpload}
                 />
               </>
             )}
          </div>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <div className="shoofly-card bg-white p-8 border-2 border-emerald-100 animate-in fade-in slide-in-from-left-4 duration-500">
             <h2 className="text-lg font-black text-emerald-900 mb-6 flex items-center gap-2 underline decoration-emerald-200 underline-offset-8">
               <FiMapPin size={20} className="text-emerald-500" /> التفاصيل الجغرافية والتواصل
             </h2>
             
             <div className="space-y-8">
                <div className="p-6 bg-emerald-50/50 rounded-3xl border-2 border-emerald-50 flex flex-col items-center text-center space-y-4">
                   <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                     locStatus === 'detecting' ? 'bg-amber-100 text-amber-600 animate-bounce' :
                     locStatus === 'success' ? 'bg-emerald-500 text-white animate-pulse' :
                     'bg-white text-emerald-500'
                   }`}>
                      {locStatus === 'detecting' ? <FiActivity size={30} /> : <FiMapPin size={30} />}
                   </div>
                   <div>
                      <h4 className="font-black text-emerald-950">تحديد موقعك عبر الـ GPS</h4>
                      <p className="text-xs text-emerald-600 mt-1">هنحدد مكانك بالظبط عشان المندوب والتاجر يوصلولك بسهولة.</p>
                   </div>
                   <Button 
                     type="button" 
                     variant="secondary" 
                     className="px-8 border-emerald-200 text-emerald-700 bg-white"
                     onClick={detectLocation}
                     isLoading={locStatus === 'detecting'}
                   >
                     {locStatus === 'success' ? 'تم تحديد الموقع بنجاح' : 'اضغط لتحديد مكاني الآن'}
                   </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                   <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-black text-slate-400">العنوان النصي بالتفصيل</label>
                      <input 
                        value={address} onChange={(e) => setAddress(e.target.value)} required
                        placeholder="مثال: مدينة نصر، شارع الطيران، عمارة 10 الدور 5"
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-emerald-500 outline-none"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400">رقم الهاتف للتواصل</label>
                      <input 
                        value={deliveryPhone} onChange={(e) => setDeliveryPhone(e.target.value)} required
                        placeholder="010xxxxxxxx"
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-primary outline-none text-left"
                        dir="ltr"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400">ملاحظات إضافية</label>
                      <input 
                        value={notes} onChange={(e) => setNotes(e.target.value)}
                        placeholder="مثل: الجرس مش شغال، أو رن عليا أول ما توصل"
                        className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-primary outline-none"
                      />
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* Step 4: Budget & Finalize */}
        {step === 4 && (
          <div className="shoofly-card bg-slate-900 border-0 p-10 text-white animate-in zoom-in-95 duration-500 overflow-hidden relative">
             <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
             <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]" />
             
             <div className="relative z-10 space-y-8">
                <div className="text-center">
                   <div className="w-20 h-20 bg-white border-4 border-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-emerald-500/20">
                      <FiCheckCircle size={40} className="text-emerald-500" />
                   </div>
                   <h2 className="text-3xl font-black text-white">أوشكنا على الانتهاء!</h2>
                   <p className="text-slate-400 text-sm mt-2 font-bold">خطوة أخيرة لنشر طلبك بقوة في السوق العربي.</p>
                </div>

                <div className="space-y-3 px-4">
                   <label className="text-xs font-black text-primary uppercase tracking-widest">💰 ميزانيتك التقديرية (اختياري)</label>
                   <div className="relative">
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-primary text-xl">ج.م</span>
                      <input 
                        type="number" value={budget} onChange={(e) => setBudget(e.target.value)}
                        placeholder="ضع سعراً تقريبياً..."
                        className="w-full bg-slate-800/50 border-2 border-white/10 rounded-3xl pr-20 py-6 text-2xl font-black focus:border-primary outline-none text-white placeholder:text-slate-600 shadow-inner"
                        dir="rtl"
                      />
                   </div>
                </div>

                <div className="bg-white/5 rounded-3xl p-8 border border-white/10 backdrop-blur-md">
                   <h4 className="text-xs font-black text-primary mb-6 tracking-widest uppercase flex items-center gap-2">
                     <FiList /> مراجعة بيانات الطلب
                   </h4>
                   <div className="grid gap-4 text-sm font-bold">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-slate-400">الطلب:</span>
                        <span className="text-white">{title}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-slate-400">التخصص:</span>
                        <span className="text-emerald-400">{subCategory}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-slate-400">العنوان:</span>
                        <span className="text-white truncate max-w-[200px]">{address}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-slate-400">الهاتف:</span>
                        <span className="text-white" dir="ltr">{deliveryPhone}</span>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                        <span className="text-slate-400 block mb-1">تفاصيل المشكلة:</span>
                        <p className="text-slate-200 text-xs leading-relaxed font-medium line-clamp-2">{description}</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
         {step > 1 ? (
           <Button variant="secondary" onClick={prevStep} className="px-8 h-14 rounded-2xl gap-2 font-black">
              <FiChevronRight size={20} /> السابق
           </Button>
         ) : <div />}

         {step < 4 ? (
           <Button onClick={nextStep} className="px-10 h-14 rounded-2xl gap-2 font-black shadow-xl shadow-primary/20">
              التالي <FiChevronLeft size={20} />
           </Button>
         ) : (
           <form onSubmit={onSubmit} className="w-full md:w-auto">
              <Button type="submit" isLoading={saving} className="w-full md:px-12 h-16 rounded-[2rem] text-lg font-extrabold shadow-2xl shadow-primary/30 gap-3">
                 نشر الطلب الآن <FiCheckCircle size={24} />
              </Button>
           </form>
         )}
      </div>
    </div>
  );
}
