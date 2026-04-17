"use client";

import { FormEvent, useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shoofly/button";
import { ErrorState } from "@/components/shared/error-state";
import { createClientRequest } from "@/lib/api/requests";
import { 
  FileText, MapPin, Grid, List, 
  CheckCircle, Image as ImageIcon, UploadCloud, Trash2, 
  Activity, Sparkles, Smartphone, Home, Truck, ShieldCheck,
  ChevronLeft, ChevronRight, Zap, DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper to map icons to dynamic category names
const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("منزل") || n.includes("بيت")) return Home;
  if (n.includes("تكنولوجيا") || n.includes("هواتف") || n.includes("موبايل")) return Smartphone;
  if (n.includes("نقل") || n.includes("شحن") || n.includes("توصيل")) return Truck;
  if (n.includes("صيانة") || n.includes("تصليح")) return ShieldCheck;
  return Zap;
};

export default function NewRequestPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form State
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [address, setAddress] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");
  const [images, setImages] = useState<File[]>([]);
  
  // Data State
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [locStatus, setLocStatus] = useState<"idle" | "detecting" | "success" | "error">("idle");
  const [latitude, setLatitude] = useState("30.0444");
  const [longitude, setLongitude] = useState("31.2357");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Locations State
  const [governorates, setGovernorates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedGov, setSelectedGov] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [brandOptions, setBrandOptions] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");

  // Fetch Brands when categoryId changes
  useEffect(() => {
    if (!categoryId) {
      setBrandOptions([]);
      setSelectedBrand("");
      return;
    }
    const flatSubs = categoryList.flatMap((c: any) => c.subcategories || []);
    const sub = flatSubs.find((s: any) => s.id === categoryId);
    if (sub?.requiresBrand && sub?.brandType) {
      fetch(`/api/brands?type=${sub.brandType}`)
        .then(res => res.json())
        .then(data => setBrandOptions(data))
        .catch(err => console.error('Failed to load brands', err));
    } else {
      setBrandOptions([]);
      setSelectedBrand("");
    }
  }, [categoryId, categoryList]);

  useEffect(() => {
    // Categories Fetch
    fetch('/api/categories', { credentials: 'include' })
      .then(r => r.json())
      .then((cats: any[]) => {
        setCategoryList(cats);
        if (cats?.length > 0) {
          setSelectedParentId(cats[0].id);
          if (cats[0].subcategories?.length > 0) {
            setCategoryId(cats[0].subcategories[0].id);
          }
        }
      }).catch(err => setError("فشل تحميل الفئات. يرجى التحديث."));

    // Locations Initial Fetch
    fetch('/api/locations')
      .then(res => res.json())
      .then(data => setGovernorates(data))
      .catch(err => console.error('Failed to load governorates', err));
  }, []);

  // Fetch Cities when gov changes
  useEffect(() => {
    if (!selectedGov) {
      setCities([]);
      return;
    }
    fetch(`/api/locations?type=cities&governorateId=${selectedGov}`)
      .then(res => res.json())
      .then(data => setCities(data))
      .catch(err => console.error('Failed to load cities', err));
  }, [selectedGov]);

  const currentParent = useMemo(() => 
    categoryList.find(c => c.id === selectedParentId), 
  [categoryList, selectedParentId]);

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
    if (step === 1 && (!title || !description || !categoryId)) {
      setError("برجاء ملء بيانات الطلب الأساسية واختيار النوع.");
      return;
    }
    if (step === 3 && address.length < 5) {
      setError("برجاء إدخال عنوان تفصيلي صحيح.");
      return;
    }
    setError(null);
    setStep(prev => prev + 1);
  };

  const prevStep = () => setStep(prev => prev - 1);

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Improved CSRF token retrieval
    const csrfToken = document.cookie.match(/(^| )csrf_token=([^;]+)/)?.[2] || "";
    
    const response = await fetch('/api/upload', { 
      method: 'POST', 
      body: formData,
      credentials: 'include',
      headers: { 'x-csrf-token': csrfToken }
    });

    if (!response.ok) throw new Error(`فشل رفع الصورة: ${file.name}`);
    const result = await response.json();
    return { filePath: result.url, fileName: file.name, mimeType: file.type, fileSize: file.size };
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!categoryId) return;

    try {
      setSaving(true);
      setError(null);
      
      // Parallel uploads with error handling
      const uploadedImages = await Promise.all(images.map(file => uploadImage(file)));
      
      const created = await createClientRequest({
        title,
        description,
        budget: budget ? Number(budget) : undefined,
        address,
        latitude: Number(latitude),
        longitude: Number(longitude),
        deliveryPhone,
        notes: notes || undefined,
        categoryId: categoryId,
        images: uploadedImages,
        governorateId: Number(selectedGov),
        cityId: Number(selectedCity),
        brandId: selectedBrand ? Number(selectedBrand) : undefined,
      });
      router.push(`/client/requests/${created.id}?new=true`);
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء إرسال الطلب");
    } finally {
      setSaving(false);
    }
  }

  const stepsList = [
    { title: "نوع الخدمة", icon: Zap },
    { title: "الصور", icon: ImageIcon },
    { title: "العنوان", icon: MapPin },
    { title: "نشر الطلب", icon: CheckCircle },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32 space-y-10 text-right" dir="rtl">
      {/* 🚀 Header & Stepper */}
      <div className="space-y-10 text-center">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/5 rounded-2xl border border-primary/10">
           <Sparkles size={16} className="text-primary" />
           <span className="text-xs font-black text-primary uppercase tracking-wider">إنشاء طلب جديد في ثوانٍ</span>
        </div>
        
        <div className="space-y-2">
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">ما الذي تبحث عنه اليوم؟</h1>
           <p className="text-muted text-sm font-bold">أكمل الخطوات البسيطة لنشر طلبك بقوة في السوق.</p>
        </div>

        {/* Liquid Stepper */}
        <div className="flex items-center justify-between relative max-w-md mx-auto">
            <div className="absolute top-5 left-0 right-0 h-1 bg-slate-100 rounded-full overflow-hidden">
               <motion.div 
                 className="h-full bg-primary"
                 initial={{ width: "0%" }}
                 animate={{ width: `${(step - 1) / (stepsList.length - 1) * 100}%` }}
               />
            </div>
            {stepsList.map((s, i) => {
              const num = i + 1;
              const active = step === num;
              const passed = step > num;
              return (
                <div key={i} className="relative z-10 flex flex-col items-center gap-3">
                   <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${
                     passed ? "bg-primary border-primary text-white scale-110" :
                     active ? "bg-white border-primary text-primary shadow-xl shadow-primary/20 scale-125" :
                     "bg-white border-slate-100 text-slate-300"
                   }`}>
                      {passed ? <CheckCircle size={18} /> : <s.icon size={18} />}
                   </div>
                   <span className={`text-[10px] font-black ${active ? "text-primary" : "text-slate-400"}`}>{s.title}</span>
                </div>
              );
            })}
        </div>
      </div>

      {error && <ErrorState message={error} />}

      <AnimatePresence mode="wait">
        {/* Step 1: Details */}
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
            className="space-y-6"
          >
             <div className="shoofly-card p-8 space-y-8">
                <div className="space-y-3">
                   <label className="text-sm font-black text-slate-900 flex items-center gap-2">
                     <FileText size={18} className="text-primary" /> ماذا تود أن تسمي طلبك؟
                   </label>
                   <input 
                     value={title} onChange={(e) => setTitle(e.target.value)}
                     placeholder="مثال: تصليح خلاط مياه الحمام بمدينة نصر"
                     className="w-full px-6 py-5 bg-muted/30 border-2 border-border rounded-[28px] text-lg font-bold focus:border-primary focus:bg-white transition-all outline-none"
                   />
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Grid size={18} className="text-primary" /> اختر الفئة المناسبة
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {categoryList.map((cat) => {
                      const Icon = getCategoryIcon(cat.name);
                      const isSelected = selectedParentId === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setSelectedParentId(cat.id);
                            if (cat.subcategories?.length > 0) {
                              setCategoryId(cat.subcategories[0].id);
                            }
                          }}
                          className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${
                            isSelected ? "bg-primary/5 border-primary shadow-lg shadow-primary/5" : "bg-white border-border"
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isSelected ? "bg-primary text-white" : "bg-muted text-slate-400"}`}>
                             <Icon size={24} />
                          </div>
                          <span className={`text-xs font-black ${isSelected ? "text-primary" : "text-slate-600"}`}>{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  
                  {currentParent && currentParent.subcategories?.length > 0 && (
                    <div className="pt-2">
                      <select 
                        value={categoryId || ""}
                        onChange={(e) => setCategoryId(Number(e.target.value))}
                        className="w-full px-6 py-4 bg-white border-2 border-primary/20 rounded-2xl text-base font-black text-primary outline-none"
                      >
                         {currentParent.subcategories.map((s: any) => (
                           <option key={s.id} value={s.id}>{s.name}</option>
                         ))}
                      </select>
                    </div>
                  )}

                  {/* Brand Selection UI */}
                  {brandOptions.length > 0 && (
                    <div className="pt-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                       <label className="text-sm font-black text-slate-900">الماركة / النوع</label>
                       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {brandOptions.map((brand: any) => {
                            const isSel = selectedBrand === brand.id.toString();
                            return (
                              <button
                                key={brand.id}
                                type="button"
                                onClick={() => setSelectedBrand(brand.id.toString())}
                                className={`px-4 py-3 rounded-2xl text-xs font-black border-2 transition-all ${
                                  isSel ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-white border-border text-slate-500 hover:border-primary/30"
                                }`}
                              >
                                {brand.name}
                              </button>
                            );
                          })}
                       </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                   <label className="text-sm font-black text-slate-900 flex items-center gap-2">
                     <List size={18} className="text-primary" /> تفاصيل إضافية عن المشكلة
                   </label>
                   <textarea 
                     value={description} onChange={(e) => setDescription(e.target.value)}
                     rows={4}
                     placeholder="يرجى ذكر ماركة الجهاز، طبيعة العطل، متى بدأت المشكلة..."
                     className="w-full px-6 py-5 bg-muted/30 border-2 border-border rounded-[28px] text-base font-bold focus:border-primary focus:bg-white transition-all outline-none resize-none"
                   />
                </div>
             </div>
          </motion.div>
        )}

        {/* Step 2: Photos */}
        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
            className="space-y-6"
          >
             <div className="shoofly-card p-10 text-center space-y-10">
                <div className="space-y-2">
                   <h2 className="text-2xl font-black text-slate-900">صور توضيحية للطلب</h2>
                   <p className="text-muted text-sm font-bold">الصور تساعد الموردين على تقديم عروض أسعار دقيقة وسريعة.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((file, i) => (
                    <div key={i} className="aspect-square rounded-[32px] border-4 border-border overflow-hidden relative group shadow-lg">
                       <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                       <button
                         type="button" onClick={() => removeImage(i)}
                         className="absolute inset-0 bg-rose-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                         <Trash2 size={24} />
                       </button>
                    </div>
                  ))}
                  {images.length < 4 && (
                    <button
                      type="button" onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-[32px] border-4 border-dashed border-primary/20 bg-primary/5 flex flex-col items-center justify-center gap-3 text-primary hover:bg-primary/10 hover:border-primary transition-all group"
                    >
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/10 group-hover:scale-110 transition-transform">
                          <UploadCloud size={24} />
                       </div>
                       <span className="text-xs font-black">ارفع صورة</span>
                    </button>
                  )}
                </div>
                <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />

                {images.length === 0 && (
                  <button onClick={() => setStep(3)} className="text-slate-400 hover:text-slate-600 font-bold text-xs underline underline-offset-4">
                    ليس لدي صور حالياً، تخطي هذه الخطوة
                  </button>
                )}
             </div>
          </motion.div>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }}
            className="space-y-6"
          >
             <div className="shoofly-card p-8 space-y-8">
                <div 
                  onClick={detectLocation}
                  className={`p-8 rounded-[40px] border-4 cursor-pointer transition-all flex flex-col items-center text-center gap-4 ${
                    locStatus === 'success' ? 'bg-emerald-50 border-emerald-500 shadow-xl shadow-emerald-500/10' : 'bg-muted/30 border-border hover:border-primary/30'
                  }`}
                >
                   <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-xl ${
                     locStatus === 'detecting' ? 'bg-amber-100 text-amber-600 animate-spin' :
                     locStatus === 'success' ? 'bg-emerald-500 text-white' : 'bg-white text-primary'
                   }`}>
                      {locStatus === 'detecting' ? <Activity size={32} /> : <MapPin size={32} />}
                   </div>
                   <div className="space-y-1">
                      <h3 className="font-black text-slate-900 text-lg">{locStatus === 'success' ? 'تم تحديد المكان بنجاح!' : 'تحديد الموقع تلقائياً'}</h3>
                      <p className="text-muted text-xs font-medium">سنقوم بتحديد إحداثيات المشكلة لسهولة الوصول.</p>
                   </div>
                   {locStatus !== 'success' && <div className="text-primary font-black text-sm underline">اضغط للتفعيل</div>}
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-sm font-black text-slate-900">العنوان النصي بالتفصيل</label>
                       <input 
                         value={address} onChange={(e) => setAddress(e.target.value)} required
                         placeholder="مثال: التجمع الخامس، المنطقة الثالثة، عمارة 45"
                         className="w-full px-6 py-5 bg-muted/30 border-2 border-border rounded-[28px] text-base font-bold focus:border-primary outline-none"
                       />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-sm font-black text-slate-900">المحافظة</label>
                          <select 
                            value={selectedGov}
                            onChange={(e) => { setSelectedGov(e.target.value); setSelectedCity(''); }}
                            className="w-full px-6 py-5 bg-muted/30 border-2 border-border rounded-[28px] text-base font-bold focus:border-primary outline-none appearance-none"
                            required
                          >
                             <option value="">اختر المحافظة</option>
                             {governorates.map((gov: any) => (
                               <option key={gov.id} value={gov.id}>{gov.name}</option>
                             ))}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-sm font-black text-slate-900">المدينة</label>
                          <select 
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="w-full px-6 py-5 bg-muted/30 border-2 border-border rounded-[28px] text-base font-bold focus:border-primary outline-none appearance-none"
                            disabled={!selectedGov}
                            required
                          >
                             <option value="">اختر المدينة</option>
                             {cities.map((city: any) => (
                               <option key={city.id} value={city.id}>{city.name}</option>
                             ))}
                          </select>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-sm font-black text-slate-900">رقم الهاتف للتواصل</label>
                          <input 
                            value={deliveryPhone} onChange={(e) => setDeliveryPhone(e.target.value)} required
                            placeholder="010xxxxxxxx"
                            className="w-full px-6 py-5 bg-muted/30 border-2 border-border rounded-[28px] text-base font-bold focus:border-primary outline-none text-left"
                            dir="ltr"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-sm font-black text-slate-900">ملاحظات العنوان</label>
                          <input 
                            value={notes} onChange={(e) => setNotes(e.target.value)}
                            placeholder="مثل: الجرس لا يعمل"
                            className="w-full px-6 py-5 bg-muted/30 border-2 border-border rounded-[28px] text-base font-bold focus:border-primary outline-none"
                          />
                       </div>
                    </div>
                </div>
             </div>
          </motion.div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <motion.div 
            key="step4"
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="space-y-8"
          >
             <div className="bg-slate-900 rounded-[48px] p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 space-y-8">
                   <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white rounded-[2rem] flex items-center justify-center text-primary shadow-xl">
                         <ShieldCheck size={32} />
                      </div>
                      <div>
                         <h2 className="text-2xl font-black">مراجعة الطلب النهائية</h2>
                         <p className="text-slate-500 text-xs font-bold">بمجرد النشر، سيصل طلبك لمئات الموردين المعتمدين.</p>
                      </div>
                   </div>

                   <div className="grid gap-3">
                      <div className="flex justify-between items-center p-5 bg-white/5 rounded-3xl border border-white/5">
                        <span className="text-slate-400 font-bold">الخدمة:</span>
                        <span className="font-black text-primary">
                          {categoryList.flatMap(c => c.subcategories || []).find(s => s.id === categoryId)?.name || "غير محدد"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-5 bg-white/5 rounded-3xl border border-white/5">
                        <span className="text-slate-400 font-bold">الموقع:</span>
                        <span className="font-bold truncate max-w-[150px]">{address}</span>
                      </div>
                      <div className="p-5 bg-white/5 rounded-3xl border border-white/5 space-y-2">
                        <span className="text-slate-400 font-bold block">وصف المشكلة:</span>
                        <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">{description}</p>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <label className="text-xs font-black text-primary flex items-center gap-1.5 uppercase tracking-widest"><DollarSign size={14} /> ميزانية تقديرية (اختياري)</label>
                      <div className="relative">
                         <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-primary text-xl">ج.م</span>
                         <input 
                           type="number" value={budget} onChange={(e) => setBudget(e.target.value)}
                           placeholder="مثال: 500"
                           className="w-full bg-slate-800/80 border-2 border-white/10 rounded-[28px] pr-20 py-6 text-2xl font-black focus:border-primary outline-none text-white transition-all shadow-inner"
                           dir="rtl"
                         />
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-amber-50 rounded-3xl p-5 border-2 border-amber-100 flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                   <Sparkles size={18} />
                </div>
                <p className="text-xs text-amber-800 font-bold leading-relaxed">
                   معلومة: نشر الميزانية التقديرية يساعد الموردين على تقديم عروض تنافسية وسريعة تتناسب مع احتياجاتك.
                </p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 lg:p-0 lg:static bg-white/10 backdrop-blur-xl border-t border-border/10 lg:bg-transparent lg:border-0 z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
           {step > 1 ? (
             <Button variant="outline" onClick={prevStep} className="h-16 px-8 rounded-[2rem] font-black">
                <ChevronRight className="ml-2" /> السابق
             </Button>
           ) : <div />}

           {step < 4 ? (
             <Button onClick={nextStep} className="h-16 px-12 flex-1 md:flex-none rounded-[2rem] font-black shadow-xl shadow-primary/20 text-lg">
                التالي <ChevronLeft className="mr-2" />
             </Button>
           ) : (
             <form onSubmit={onSubmit} className="flex-1 md:flex-none">
                <Button type="submit" isLoading={saving} className="h-16 w-full px-12 rounded-[2rem] font-black shadow-2xl shadow-primary/30 text-lg">
                   تأكيد ونشر الطلب <CheckCircle className="mr-2" />
                </Button>
             </form>
           )}
        </div>
      </div>
    </div>
  );
}
