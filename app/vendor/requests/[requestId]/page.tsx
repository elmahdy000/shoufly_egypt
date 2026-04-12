"use client";

import { FormEvent, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/shoofly/button";
import { ErrorState } from "@/components/shared/error-state";
import { createVendorBid } from "@/lib/api/bids";
import { getRequestDetails } from "@/lib/api/requests";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { 
  FiFileText, 
  FiMapPin, 
  FiCheckCircle, 
  FiArrowLeft,
  FiBriefcase,
  FiInfo,
  FiSend,
  FiAlertTriangle,
  FiCamera,
  FiX,
  FiPackage
} from "react-icons/fi";

function VendorRequestDetails({ requestId }: { requestId: number }) {
  const router = useRouter();
  const { data, loading, error } = useAsyncData(() => getRequestDetails(requestId), [requestId]);
  
  const [description, setDescription] = useState("");
  const [netPrice, setNetPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [includesProduct, setIncludesProduct] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadImage(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      console.log('Uploading file:', file.name, file.size);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Important: send cookies for auth
      });
      const data = await res.json();
      console.log('Upload response:', data);
      if (data.success) {
        return data.fileUrl;
      }
      console.error('Upload failed:', data.error);
      return null;
    } catch (err) {
      console.error('Upload failed:', err);
      return null;
    }
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    console.log('Files selected:', files?.length);
    if (!files || files.length === 0) return;
    
    setUploadingImages(true);
    const uploadedUrls: string[] = [];
    
    for (const file of Array.from(files)) {
      const url = await uploadImage(file);
      if (url) {
        console.log('Image uploaded, URL:', url);
        uploadedUrls.push(url);
      }
    }
    
    console.log('Total uploaded URLs:', uploadedUrls);
    setImages(prev => [...prev, ...uploadedUrls]);
    console.log('Images state updated');
    setUploadingImages(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeImage(index: number) {
    setImages(prev => prev.filter((_, i) => i !== index));
  }

  async function submitBid(e: FormEvent) {
    e.preventDefault();
    const priceNum = Number(netPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFeedback({ type: 'error', text: 'يرجى وضع تسعير صحيح وواقعي.' });
      return;
    }
    
    if (includesProduct && images.length === 0) {
      setFeedback({ type: 'error', text: 'يرجى رفع صور للمنتجات المقدمة.' });
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback(null);
      await createVendorBid({ requestId, description, netPrice: priceNum, images });
      setFeedback({ type: 'success', text: 'تم إرسال تسعيرتك للعميل بنجاح!' });
      setDescription("");
      setNetPrice("");
      setImages([]);
      setIncludesProduct(false);
      setTimeout(() => router.push("/vendor/bids"), 2000);
    } catch (err) {
      setFeedback({ type: 'error', text: err instanceof Error ? err.message : "حدث خطأ أثناء رفع العرض" });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
      <div className="flex flex-col items-center text-[#767684]">
        <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">جاري تحميل التفاصيل...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-[#F8F9FA] p-6">
      <ErrorState message={error} />
    </div>
  );
  
  if (!data) return (
    <div className="min-h-screen bg-[#F8F9FA] p-6">
      <ErrorState message="الطلب غير متوفر حالياً أو تم حذفه" />
    </div>
  );

  const isOpen = data.status === 'OPEN_FOR_BIDDING';

  return (
    <div className="font-sans dir-rtl text-right">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-4 space-y-4">
        {feedback && (
          <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {feedback.type === 'success' ? <FiCheckCircle size={18} /> : <FiAlertTriangle size={18} />}
            {feedback.text}
          </div>
        )}

        {/* Request Details Card */}
        <div className="bg-white rounded-xl border border-[#E7E7E7] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#E7E7E7]">
            <h2 className="font-semibold text-sm text-[#0F1111] flex items-center gap-2">
              <FiFileText size={16} className="text-[#565959]" /> تفاصيل الطلب
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <p className="text-xs text-[#565959] font-medium mb-2">وصف المشكلة</p>
              <p className="text-sm text-[#0F1111] bg-slate-50 p-3 rounded-lg leading-relaxed">
                {data.description.includes(']') 
                  ? data.description.substring(data.description.indexOf(']') + 1).trim() 
                  : data.description}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                <FiMapPin size={16} />
              </div>
              <div>
                <p className="text-[10px] text-[#565959] font-medium mb-0.5">العنوان</p>
                <p className="text-sm font-semibold text-[#0F1111]">{data.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                <FiBriefcase size={16} />
              </div>
              <div>
                <p className="text-[10px] text-[#565959] font-medium mb-0.5">الفئة</p>
                <p className="text-sm font-semibold text-[#0F1111]">خدمات عامة</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bid Form */}
        {isOpen ? (
          <form onSubmit={submitBid} className="bg-white rounded-xl border border-[#E7E7E7] shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <FiSend size={16} />
              </div>
              <h2 className="font-semibold text-sm text-[#0F1111]">تقديم عرض</h2>
            </div>
            
            <div className="space-y-3">
              {/* Product/Service Toggle */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-[#E7E7E7]">
                <input
                  type="checkbox"
                  id="includesProduct"
                  checked={includesProduct}
                  onChange={(e) => setIncludesProduct(e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                />
                <label htmlFor="includesProduct" className="flex-1 text-xs text-[#0F1111] cursor-pointer">
                  <span className="font-medium">هل هذا العرض يتضمن منتج؟</span>
                  <p className="text-[10px] text-[#565959] mt-0.5">مثل: قطع غيار، أجهزة، مستلزمات...</p>
                </label>
                <FiPackage size={18} className={includesProduct ? "text-primary" : "text-slate-400"} />
              </div>

              <div>
                <label className="text-[10px] text-[#565959] font-medium block mb-1.5">وصف العرض</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                  placeholder="اشرح للعميل كيف ستنفذ المهمة..."
                  className="w-full bg-slate-50 border border-[#E7E7E7] px-3 py-2.5 rounded-lg outline-none focus:border-primary text-xs resize-none transition-all"
                />
              </div>
              
              <div>
                <label className="text-[10px] text-[#565959] font-medium block mb-1.5">السعر (ج.م)</label>
                <div className="relative">
                  <input 
                    type="number"
                    value={netPrice}
                    onChange={(e) => setNetPrice(e.target.value)}
                    required
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-[#E7E7E7] px-3 py-2.5 rounded-lg outline-none focus:border-primary text-base font-bold text-center transition-all"
                    dir="ltr"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#767684] text-xs">ج.م</span>
                </div>
              </div>

              {/* Image Upload Section - Only show if includesProduct */}
              {includesProduct && (
                <div className="bg-white rounded-xl border border-[#E7E7E7] p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FiCamera size={14} className="text-primary" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#0F1111] block">صور المنتجات</label>
                      <p className="text-[10px] text-[#565959]">مطلوب عند تقديم منتج</p>
                    </div>
                    {images.length > 0 && (
                      <span className="mr-auto bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-full">
                        {images.length} صورة
                      </span>
                    )}
                  </div>
                  
                  {/* Image Grid - Thumbnails */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {images.map((url, index) => (
                        <div key={index} className="relative group cursor-pointer">
                          {/* Thumbnail */}
                          <div 
                            className="aspect-square rounded-xl overflow-hidden border-2 border-[#E7E7E7] bg-slate-100"
                            onClick={() => setSelectedImage(url)}
                          >
                            <img 
                              src={url} 
                              alt={`Product ${index + 1}`} 
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {/* Click to view overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl flex items-center justify-center">
                              <span className="text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-2 py-1 rounded-full">
                                عرض
                              </span>
                            </div>
                          </div>
                          {/* Delete button - positioned outside to avoid conflict */}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                            className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 z-10"
                          >
                            <FiX size={14} />
                          </button>
                          {/* Image number badge */}
                          <span className="absolute top-2 left-2 w-5 h-5 bg-primary/80 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Button - Enhanced */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImages}
                    className="w-full py-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-600 hover:bg-primary/5 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    {uploadingImages ? (
                      <>
                        <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                        جاري رفع الصور...
                      </>
                    ) : (
                      <>
                        <FiCamera size={18} />
                        {images.length === 0 ? 'إضافة صور للمنتجات' : 'إضافة المزيد من الصور'}
                      </>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
              )}

              {/* Lightbox Modal - Outside includesProduct block */}
              {selectedImage && (
                <div 
                  className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                  onClick={() => setSelectedImage(null)}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <FiX size={24} />
                  </button>
                  <img 
                    src={selectedImage} 
                    alt="Full size" 
                    className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}

              <Button 
                type="submit" 
                isLoading={isSubmitting} 
                className="w-full h-10 text-sm font-semibold gap-1.5"
              >
                <FiSend size={14} /> إرسال العرض
              </Button>
            </div>
          </form>
        ) : (
          <div className="bg-slate-50 rounded-xl border border-[#E7E7E7] p-6 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-400">
              <FiInfo size={20} />
            </div>
            <h3 className="text-sm font-semibold text-[#0F1111] mb-1">الطلب مغلق</h3>
            <p className="text-xs text-[#565959]">لم يعد يقبل عروض جديدة</p>
          </div>
        )}

        {/* Tips Card */}
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <FiInfo size={14} />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-900 mb-0.5">نصيحة</p>
              <p className="text-[10px] text-amber-700">
                قدم وصفاً واضحاً مع ذكر الضمان. العملاء يفضلون العروض التفصيلية.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VendorRequestDetailsPage() {
  const params = useParams<{ requestId: string }>();
  const parsed = Number(params.requestId);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return <ErrorState message="معرف الطلب غير صحيح، يرجى المحاولة لاحقاً." />;
  }

  return <VendorRequestDetails requestId={parsed} />;
}
