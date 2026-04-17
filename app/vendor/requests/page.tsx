"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ErrorState } from "@/components/shared/error-state";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { listVendorOpenRequests } from "@/lib/api/requests";
import {
  FiBriefcase, FiMapPin, FiFilter, FiInbox, FiChevronLeft
} from "react-icons/fi";

const FILTERS = [
  { value: "ALL", label: "كل الطلبات" },
  { value: "OPEN_FOR_BIDDING", label: "طلبات جديدة" },
  { value: "BIDS_RECEIVED", label: "عليها عروض" },
];

export default function VendorRequestsPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedGov, setSelectedGov] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  
  const [governorates, setGovernorates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  // Initial Fetch: Governorates
  useState(() => {
    fetch('/api/locations')
      .then(res => res.json())
      .then(data => setGovernorates(data))
      .catch(err => console.error('Failed to load governorates', err));
  });

  // Fetch Cities when gov changes
  const handleGovChange = (govId: string) => {
    setSelectedGov(govId);
    setSelectedCity("");
    if (!govId) {
      setCities([]);
      return;
    }
    fetch(`/api/locations?type=cities&governorateId=${govId}`)
      .then(res => res.json())
      .then(data => setCities(data))
      .catch(err => console.error('Failed to load cities', err));
  };

  const { data, loading, error } = useAsyncData(
    () => listVendorOpenRequests({ 
      governorateId: selectedGov ? Number(selectedGov) : undefined,
      cityId: selectedCity ? Number(selectedCity) : undefined
    }), 
    [selectedGov, selectedCity]
  );

  const rows = useMemo(() => {
    const list = data ?? [];
    if (statusFilter === "ALL") return list;
    return list.filter((item: any) => item.status === statusFilter);
  }, [data, statusFilter]);

  return (
    <div className="space-y-6 min-h-screen font-sans text-right" dir="rtl">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">فرص السوق المتاحة</h1>
          <p className="text-sm text-slate-500 mt-2">استكشف وقدم عروضك على الطلبات الجديدة</p>
        </div>
        <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-xs text-emerald-700 font-semibold">
            {loading ? "جاري التحميل..." : `${data?.length ?? 0} فرصة متاحة`}
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">البحث والتصفية</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Governorate Filter */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-600 mb-2">المحافظة</label>
            <FiMapPin className="absolute right-4 top-10 text-slate-400" size={16} />
            <select
              value={selectedGov}
              onChange={(e) => handleGovChange(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
            >
              <option value="">كل المحافظات</option>
              {governorates.map((gov: any) => (
                <option key={gov.id} value={gov.id}>{gov.name}</option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-600 mb-2">المدينة</label>
            <FiFilter className="absolute right-4 top-10 text-slate-400" size={16} />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedGov}
            >
              <option value="">كل المدن</option>
              {cities.map((city: any) => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {FILTERS.map((f) => {
            const active = statusFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`shrink-0 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all border ${
                  active
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-white"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
          <p className="text-slate-500 font-medium">جاري البحث عن أفضل الفرص...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && rows.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
            <FiBriefcase size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">لا توجد فرص متاحة حالياً</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">
            ستصلك تنبيهات فور ظهور طلبات جديدة تتطابق مع معايير بحثك
          </p>
          <button
            onClick={() => {
              setSelectedGov("");
              setSelectedCity("");
              setStatusFilter("ALL");
            }}
            className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
      )}

      {/* Opportunities Grid */}
      {!loading && !error && rows.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((request: any) => {
            const isOpen = request.status === "OPEN_FOR_BIDDING";
            return (
              <Link
                key={request.id}
                href={`/vendor/requests/${request.id}`}
                className="block bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all group overflow-hidden"
              >
                {/* Header */}
                <div className={`p-5 border-b border-slate-100 ${isOpen ? "bg-emerald-50" : "bg-slate-50"}`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-2 ${
                        isOpen ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
                      }`}>
                        {isOpen ? "مستقبل عروض" : "شغالين فيها"}
                      </span>
                      <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
                        {request.title}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  {/* Description */}
                  {request.description && (
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {request.description}
                    </p>
                  )}

                  {/* Location */}
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <FiMapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{request.address || "عنوان غير محدد"}</span>
                  </div>

                  {/* Request ID */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500 font-mono">#{request.id}</span>
                    <span className={`text-xs font-bold flex items-center gap-1 ${
                      isOpen ? "text-emerald-600" : "text-slate-500"
                    }`}>
                      {isOpen ? "قدم عرضك →" : "تفاصيل →"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Results Summary */}
      {!loading && !error && rows.length > 0 && (
        <div className="text-center text-sm text-slate-600 py-4">
          عرض <span className="font-bold text-slate-900">{rows.length}</span> من <span className="font-bold text-slate-900">{data?.length ?? 0}</span> فرصة متاحة
        </div>
      )}
    </div>
  );
}
