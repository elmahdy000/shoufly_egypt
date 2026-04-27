import React from "react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingService } from "@/lib/services/landing";
import { getCurrentUserFromCookie } from "@/lib/auth";
import { UserRole } from "@/lib/types/landing";

// Import highly optimized modular sections
import { 
  HeroSection, 
  TrustSection, 
  RedesignedCategoryExplorer, 
  HowItWorks, 
  ComparisonBlock, 
  PopularServices, 
  ImprovedDeals, 
  FAQSection, 
  FinalCTA 
} from "@/components/landing/LandingSections";

export default async function ShooflyLanding() {
  // Parallel fetching for maximum SSR performance
  const results = await Promise.allSettled([
    LandingService.getCategories(),
    LandingService.getFeaturedServices(),
    LandingService.getLatestDeals(),
    LandingService.getBrands(),
    getCurrentUserFromCookie()
  ]);

  // Graceful degradation for API failures
  const categories = results[0].status === 'fulfilled' ? results[0].value : [];
  const featuredServices = results[1].status === 'fulfilled' ? results[1].value : [];
  const deals = results[2].status === 'fulfilled' ? results[2].value : [];
  const brands = results[3].status === 'fulfilled' ? results[3].value : [];
  const user = results[4].status === 'fulfilled' ? results[4].value : null;
  const userRole = user?.role as UserRole | null;

  return (
    <div className="min-h-screen bg-white text-right dir-rtl font-cairo selection:bg-primary/20 text-slate-900" dir="rtl">
      <LandingHeader userRole={userRole} />
      
      <main>
        <HeroSection userRole={userRole} />
        <TrustSection />
        <RedesignedCategoryExplorer categories={categories} brands={brands} />
        <HowItWorks />
        <ComparisonBlock />
        <PopularServices services={featuredServices} />
        <ImprovedDeals deals={deals} />
        <FAQSection />
        <FinalCTA userRole={userRole} />
      </main>

      <LandingFooter userRole={userRole} />
    </div>
  );
}
