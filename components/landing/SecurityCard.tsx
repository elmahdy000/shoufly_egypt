import { FiShield } from "react-icons/fi";
import { LandingCard, SectionTitle } from "./shared/Primitives";

export function SecurityCard() {
  return (
    <LandingCard>
      <SectionTitle title="نظام الأمان" icon={FiShield} iconColor="text-slate-400" className="mb-3" />
      <p className="text-[10px] font-bold text-slate-500 leading-relaxed text-right">
        جميع المعاملات المالية محمية بنظام الإسكرو والدفع المضمون لضمان حق العميل والمورد.
      </p>
    </LandingCard>
  );
}
