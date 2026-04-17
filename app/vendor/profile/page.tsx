"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/shoofly/button";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { 
  FiUser, 
  FiBriefcase, 
  FiCheckCircle, 
  FiSave, 
  FiLogOut, 
  FiSettings,
  FiAlertCircle, 
  FiCheck,
  FiPhone,
  FiChevronDown,
  FiChevronLeft
} from "react-icons/fi";
import { logoutUser } from "@/lib/api/auth";
import { apiFetch } from "@/lib/api/client";

interface Category {
  id: number;
  name: string;
  slug: string;
  subcategories: SubCategory[];
  _count: { subcategories: number };
}

interface SubCategory {
  id: number;
  name: string;
  slug: string;
  parentId: number;
  requiresBrand: boolean;
  brandType: string;
}

interface Brand {
  id: number;
  name: string;
  type: string;
}

export default function VendorProfilePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  const [allBrands, setAllBrands] = useState<Record<string, Brand[]>>({});

  // Fetch categories with subcategories tree
  const { data: cats, loading: catsLoading } = useAsyncData(() => apiFetch<Category[]>('/api/categories/tree', "VENDOR"), []);
  const { data: profile, loading: profileLoading, refresh: refreshProfile } = useAsyncData(() => apiFetch<any>('/api/auth/me', "VENDOR"), []);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCats, setSelectedCats] = useState<number[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<number[]>([]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || "");
      setPhone(profile.phone || "");
      setSelectedCats(profile.vendorCategories?.map((vc: any) => vc.categoryId) || []);
      setSelectedBrands(profile.vendorBrands?.map((vb: any) => vb.brandId) || []);
    }
  }, [profile]);

  // Fetch brands for needed types when categories or selections change
  useEffect(() => {
    if (!cats) return;
    const neededTypes = new Set<string>();
    cats.forEach(c => {
      c.subcategories.forEach(sub => {
        if (sub.requiresBrand && sub.brandType && selectedCats.includes(sub.id)) {
          neededTypes.add(sub.brandType);
        }
      });
    });

    neededTypes.forEach(type => {
      if (!allBrands[type]) {
        apiFetch<Brand[]>(`/api/brands?type=${type}`, "VENDOR")
          .then(data => setAllBrands(prev => ({ ...prev, [type]: data })));
      }
    });
  }, [cats, selectedCats]);

  async function handleLogout() {
    await logoutUser();
    router.push("/login");
  }

  const toggleCategory = (id: number) => {
    setSelectedCats(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const toggleBrand = (id: number) => {
    setSelectedBrands(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const toggleExpand = (id: number) => {
    setExpandedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const isAllSubcategoriesSelected = (category: Category) => {
    if (category.subcategories.length === 0) return false;
    return category.subcategories.every(sub => selectedCats.includes(sub.id));
  };

  const selectAllSubcategories = (category: Category) => {
    const allSelected = isAllSubcategoriesSelected(category);
    if (allSelected) {
      // Deselect all subcategories
      setSelectedCats(prev => prev.filter(id => !category.subcategories.some(sub => sub.id === id)));
    } else {
      // Select all subcategories
      const subIds = category.subcategories.map(sub => sub.id);
      setSelectedCats(prev => [...new Set([...prev, ...subIds])]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await apiFetch('/api/vendor/profile', "VENDOR", {
        method: "PATCH",
        body: { fullName, phone, categoryIds: selectedCats, brandIds: selectedBrands }
      });
      setMessage({ text: "تم تحديث البيانات بنجاح!", type: 'success' });
      refreshProfile();
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "فشل تحديث البيانات", type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const isLoading = catsLoading || profileLoading;

  return (
    <div className="font-sans dir-rtl text-right">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-4 space-y-4">
        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 font-medium ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
             {message.type === 'success' ? <FiCheckCircle size={20} /> : <FiAlertCircle size={20} />} 
             {message.text}
          </div>
        )}

        {/* Status Card */}
        <div className="bg-white rounded-xl border border-[#E7E7E7] shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <FiSettings size={20} />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-[#0F1111]">حالة الحساب</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm text-emerald-600 font-medium">مورد نشط</span>
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-1.5 text-rose-500 font-medium hover:bg-rose-50 p-2 rounded-lg transition-all text-xs"
            >
               <FiLogOut size={16} /> خروج
            </button>
          </div>
        </div>

        {/* Basic Info Card */}
        <div className="bg-white rounded-xl border border-[#E7E7E7] shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <FiUser size={16} />
            </div>
            <h2 className="font-semibold text-sm text-[#0F1111]">البيانات الأساسية</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#565959] font-medium block mb-2">الاسم / النشاط التجاري</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 border border-[#E7E7E7] px-4 py-3 rounded-xl outline-none focus:border-primary font-semibold text-[#0F1111] transition-all" 
                placeholder="أدخل اسمك أو اسم شركتك"
              />
            </div>
            <div>
              <label className="text-xs text-[#565959] font-medium block mb-2">هاتف التواصل</label>
              <div className="relative">
                <FiPhone className="absolute right-4 top-1/2 -translate-y-1/2 text-[#767684]" size={18} />
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  dir="ltr"
                  className="w-full bg-slate-50 border border-[#E7E7E7] px-4 pr-12 py-3 rounded-xl outline-none focus:border-primary font-semibold text-[#0F1111] text-left transition-all" 
                  placeholder="+20 XXX XXX XXXX"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Categories Card - Hierarchical Tree */}
        <div className="bg-white rounded-xl border border-[#E7E7E7] shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <FiBriefcase size={16} />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-sm text-[#0F1111]">تخصصات العمل</h2>
              <p className="text-xs text-[#565959]">اختر التخصصات والفئات الفرعية</p>
            </div>
            {selectedCats.length > 0 && (
              <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
                {selectedCats.length} محدد
              </span>
            )}
          </div>
          
          {isLoading ? (
            <div className="text-center py-8 text-[#767684]">
              <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm">جاري تحميل التخصصات...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(cats ?? []).map((category: Category) => (
                <div key={category.id} className="border border-[#E7E7E7] rounded-xl overflow-hidden bg-slate-50">
                  {/* Parent Category Header */}
                  <div 
                    className="flex items-center gap-3 p-3 bg-white cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => toggleExpand(category.id)}
                  >
                    <div className="text-amber-500">
                      {expandedCategories.includes(category.id) ? (
                        <FiChevronDown size={20} />
                      ) : (
                        <FiChevronLeft size={20} />
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-sm text-[#0F1111]">{category.name}</span>
                      <span className="text-xs text-[#565959] mr-2">
                        ({category._count.subcategories} فرعي)
                      </span>
                    </div>
                    {category._count.subcategories > 0 && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); selectAllSubcategories(category); }}
                        className={`text-xs font-medium px-2 py-1 rounded-full transition-colors ${
                          isAllSubcategoriesSelected(category)
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-primary/10 hover:text-primary'
                        }`}
                      >
                        {isAllSubcategoriesSelected(category) ? 'إلغاء الكل' : 'تحديد الكل'}
                      </button>
                    )}
                  </div>
                  
                  {/* Subcategories List */}
                  {expandedCategories.includes(category.id) && category.subcategories.length > 0 && (
                    <div className="p-3 space-y-2 border-t border-[#E7E7E7]">
                      {category.subcategories.map((sub) => {
                        const brandsForThis = sub.requiresBrand ? allBrands[sub.brandType] || [] : [];
                        const isSelected = selectedCats.includes(sub.id);

                        return (
                          <div key={sub.id} className="space-y-2">
                             <label 
                               className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                 isSelected 
                                   ? 'bg-primary/5 border border-primary text-primary' 
                                   : 'bg-white border border-[#E7E7E7] hover:border-primary/30'
                               }`}
                             >
                               <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${
                                 isSelected 
                                   ? 'bg-primary border-primary text-white' 
                                   : 'bg-white border-[#E7E7E7]'
                               }`}>
                                 {isSelected && <FiCheck size={12} strokeWidth={3} />}
                               </div>
                               <span className="font-medium text-sm flex-1">{sub.name}</span>
                               <input 
                                 type="checkbox" 
                                 className="hidden"
                                 checked={isSelected}
                                 onChange={() => toggleCategory(sub.id)}
                               />
                             </label>

                             {/* Brands List for this Subcategory */}
                             {isSelected && sub.requiresBrand && (
                               <div className="mr-8 p-3 bg-white border border-dashed border-slate-200 rounded-xl">
                                  <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider">الأنواع / الماركات المتاحة</p>
                                  <div className="flex flex-wrap gap-2">
                                     {brandsForThis.length === 0 ? (
                                       <span className="text-xs text-slate-400">جاري التحميل...</span>
                                     ) : brandsForThis.map(brand => (
                                       <button
                                         key={brand.id}
                                         type="button"
                                         onClick={() => toggleBrand(brand.id)}
                                         className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                           selectedBrands.includes(brand.id)
                                             ? 'bg-primary text-white border-primary border-b-2 active:border-b-0 translate-y-[-1px] active:translate-y-0'
                                             : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                                         }`}
                                       >
                                         {brand.name}
                                       </button>
                                     ))}
                                  </div>
                               </div>
                             )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <Button 
          onClick={handleSave} 
          isLoading={saving} 
          className="w-full h-11 text-sm font-semibold"
        >
          <FiSave size={16} className="ml-1.5" /> حفظ التغييرات
        </Button>
      </div>
    </div>
  );
}
