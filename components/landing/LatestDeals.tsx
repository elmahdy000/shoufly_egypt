import Link from "next/link";
import { FiAward, FiArrowRight } from "react-icons/fi";
import { Deal } from "@/lib/types/landing";
import { LandingCard, SectionTitle } from "./shared/Primitives";

interface LatestDealsProps {
  deals: Deal[];
}

export function LatestDeals({ deals }: LatestDealsProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionTitle title="أحدث العروض الحصرية" icon={FiAward} />
        <Link href="/client/requests" className="text-[11px] font-black text-primary hover:text-primary-hover flex items-center gap-1.5 transition-colors">
          عرض كل العروض <FiArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {deals.map(deal => (
          <LandingCard key={deal.id} className="p-0 overflow-hidden flex flex-col h-full group border-slate-200/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 bg-white relative rounded-[24px]">
            
            {/* Top Image Section - Compact and Fixed Height */}
            <div className="relative h-48 overflow-hidden">
              <img 
                src={deal.img} 
                alt={deal.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
              
              {/* Smaller, Cleaner Badge */}
              <div className="absolute top-3 right-3">
                <span className="bg-primary/90 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-1 rounded-lg shadow-lg uppercase tracking-tight">عرض خاص</span>
              </div>
            </div>

            {/* Content Section - Compact and Structured */}
            <div className="p-5 flex flex-col flex-1">
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-bold text-slate-400">متخصص معتمد</span>
                </div>
                <h3 className="text-base font-black text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                  {deal.title}
                </h3>
                <p className="text-[11px] font-bold text-slate-500 line-clamp-2 leading-relaxed">
                  احصل على أفضل جودة وضمان كامل لرضاك من محترفينا المعتمدين.
                </p>
              </div>

              {/* Bottom Row - Clean Price/Action alignment */}
              <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-1">
                    <span className="text-primary text-xl font-black">{deal.price}</span>
                    <span className="text-[10px] font-black text-primary">ج.م</span>
                  </div>
                  {deal.oldPrice && (
                    <span className="text-[9px] text-slate-400 line-through font-bold">{deal.oldPrice} ج.م</span>
                  )}
                </div>
                
                <Link href={`/client/requests/new?service=${encodeURIComponent(deal.title)}&dealId=${deal.id}`}>
                  <button className="bg-primary text-white text-[11px] font-black px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all">
                    احجز العرض
                  </button>
                </Link>
              </div>
            </div>
          </LandingCard>
        ))}
      </div>
    </section>
  );
}
