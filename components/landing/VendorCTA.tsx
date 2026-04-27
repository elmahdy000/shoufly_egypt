import Link from "next/link";
import { FiUsers, FiArrowRight } from "react-icons/fi";
import { ImprovedButton } from "@/components/ui/improved-button";
import { UserRole } from "@/lib/types/landing";
import { LandingCard } from "./shared/Primitives";

interface VendorCTAProps {
  userRole?: UserRole;
}

export function VendorCTA({ userRole }: VendorCTAProps) {
  // Responsibility: Hide for vendors/admins as they are already onboarded
  if (userRole === 'VENDOR' || userRole === 'ADMIN') return null;

  return (
    <LandingCard variant="dark" className="relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
      <div className="space-y-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <FiUsers size={20} />
          </div>
          <div className="space-y-1">
            <div className="text-[13px] font-black tracking-tight text-white">سجل كمورد</div>
            <p className="text-[10px] font-bold text-white/60">زود مبيعاتك واوصل لعملاء أكتر</p>
          </div>
        </div>
        <Link href="/register?role=VENDOR" className="block w-full">
          <ImprovedButton className="w-full bg-primary text-white h-11 rounded-2xl text-[11px] font-black flex items-center justify-center gap-2 hover:bg-primary-hover shadow-lg shadow-primary/10 transition-all">
            انضم لينا دلوقتي <FiArrowRight size={14} />
          </ImprovedButton>
        </Link>
      </div>
    </LandingCard>
  );
}
