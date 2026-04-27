import React from "react";
import Link from "next/link";
import { FiGrid, FiArrowRight } from "react-icons/fi";
import { FeaturedService } from "@/lib/types/landing";
import { LandingCard, SectionTitle } from "./shared/Primitives";

interface FeaturedServicesProps {
  services: FeaturedService[];
}

export function FeaturedServices({ services }: FeaturedServicesProps) {
  return (
    <section className="space-y-6">
      <SectionTitle title="خدمات مختارة لك" icon={FiGrid} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {services.map(service => (
          <Link
            key={service.id}
            href={`/client/requests/new?service=${encodeURIComponent(service.name)}`}
            className="group block relative h-full"
          >
            <LandingCard className="h-full p-5 hover:border-primary hover:shadow-xl hover:shadow-primary/5 relative overflow-hidden transition-all duration-500 bg-white border-slate-100 rounded-[20px]">
              {service.popular && (
                <div className="absolute top-0 left-0 bg-primary text-white text-[8px] font-black px-2.5 py-1 rounded-br-xl shadow-md z-10">الأكثر طلباً</div>
              )}
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500 mb-4 shadow-inner">
                <service.icon size={22} />
              </div>
              <div className="space-y-1.5">
                <div className="text-[13px] font-black text-slate-900 group-hover:text-primary transition-colors leading-tight line-clamp-1">{service.name}</div>
                <p className="text-[10px] font-bold text-slate-500 leading-normal line-clamp-2">استقبل عروض أسعار من أفضل المتخصصين فوراً.</p>
              </div>
              <div className="mt-4 flex items-center justify-end text-[10px] font-black text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                <FiArrowRight size={14} />
              </div>
            </LandingCard>
          </Link>
        ))}
      </div>
    </section>
  );
}
