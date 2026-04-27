"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FiSearch } from "react-icons/fi";

const STATUSES = [
  { value: "ALL", label: "الكل" },
  { value: "PENDING_ADMIN_REVISION", label: "مراجعة" },
  { value: "OPEN_FOR_BIDDING", label: "مفتوح" },
  { value: "OFFERS_FORWARDED", label: "عروض" },
  { value: "ORDER_PAID_PENDING_DELIVERY", label: "تنفيذ" },
  { value: "CLOSED_SUCCESS", label: "مكتمل" },
  { value: "CLOSED_CANCELLED", label: "ملغي" },
];

export function FiltersBar({ initialSearch, initialStatus }: { initialSearch: string; initialStatus: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) params.set("search", search);
      else params.delete("search");
      
      if (status && status !== "ALL") params.set("status", status);
      else params.delete("status");

      params.set("page", "1"); // reset to page 1 on filter change
      
      router.push(`${pathname}?${params.toString()}`);
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timer);
  }, [search, status, pathname, router, searchParams]);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-4 flex flex-col md:flex-row gap-4 items-center shadow-sm">
      <div className="relative flex-1 w-full group">
        <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
        <input 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث برقم الطلب أو العنوان..."
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl pr-12 pl-4 py-3 text-sm font-bold focus:bg-white focus:border-primary/50 outline-none transition-all"
        />
      </div>
      <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
         {STATUSES.map(s => (
           <button
             key={s.value}
             onClick={() => setStatus(s.value)}
             className={`shrink-0 px-5 py-3 rounded-2xl text-[11px] uppercase tracking-widest font-black transition-all border ${
               status === s.value 
                 ? "bg-primary text-white border-primary shadow-md shadow-primary/20" 
                 : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50 hover:text-slate-900"
             }`}
           >
             {s.label}
           </button>
         ))}
      </div>
    </div>
  );
}
