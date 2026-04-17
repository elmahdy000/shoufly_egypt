// lib/responsive-utils.ts
// فئات مساعدة للـ responsive sizing

export const responsiveClasses = {
  // Container classes
  container: "w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  containerSmall: "w-full max-w-4xl mx-auto px-4 sm:px-6",
  containerLarge: "w-full max-w-6xl mx-auto px-4",
  
  // Text sizing
  textResponsive: "text-sm sm:text-base md:text-lg",
  headingResponsive: "text-xl sm:text-2xl md:text-3xl lg:text-4xl",
  headingLargeResponsive: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl",
  
  // Padding responsive
  paddingResponsive: "p-4 sm:p-6 md:p-8 lg:p-12",
  paddingResponsiveY: "py-4 sm:py-6 md:py-8 lg:py-12",
  paddingResponsiveX: "px-4 sm:px-6 md:px-8 lg:px-12",
  
  // Grid responsive
  gridAuto: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6",
  gridDual: "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6",
  
  // Gap responsive
  gapResponsive: "gap-4 sm:gap-6 md:gap-8",
};

// CSS-in-JS helper for clamp
export const clampValue = (min: number, preferred: number, max: number, unit = "px") => {
  return `clamp(${min}${unit}, ${preferred}vw, ${max}${unit})`;
};

// مثال الاستخدام:
/*
import { responsiveClasses, clampValue } from '@/lib/responsive-utils';

export default function MyPage() {
  return (
    <div className={responsiveClasses.container}>
      <h1 className={responsiveClasses.headingLargeResponsive}>العنوان</h1>
      <p className={responsiveClasses.textResponsive}>النص</p>
    </div>
  );
}
*/
