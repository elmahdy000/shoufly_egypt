import type { Metadata, Viewport } from "next";
import { Tajawal, Plus_Jakarta_Sans, Cairo } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--next-tajawal",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["700", "800", "900"],
  variable: "--next-cairo",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--next-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shoofly | شوفلاي",
  description: "المنصة الرائدة للخدمات والتوصيل الفوري",
  applicationName: "Shoofly",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0052FF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="ar" 
      dir="rtl" 
      className={`h-full antialiased ${tajawal.variable} ${cairo.variable} ${plusJakartaSans.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-tajawal bg-background text-foreground tracking-tight selection:bg-primary/20">
        {children}
      </body>
    </html>
  );
}
