import type { Metadata, Viewport } from "next";
import { Tajawal, Plus_Jakarta_Sans, Cairo } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import SupportChatWidget from "@/components/support/ChatWidget";

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
  title: {
    default: "شوفلي — اطلب أي خدمة في ثوانٍ",
    template: "%s | شوفلي",
  },
  description:
    "منصة شوفلي تربطك بأفضل مقدمي الخدمات والموردين المعتمدين في مصر. اطلب خدمتك وتلقَّ عروض أسعار فورية من مئات المتخصصين.",
  applicationName: "شوفلي",
  keywords: [
    "خدمات منزلية",
    "صيانة",
    "شوفلي",
    "توصيل",
    "مزادات خدمات",
    "موردين مصر",
    "أفضل أسعار",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "ar_EG",
    siteName: "شوفلي",
    title: "شوفلي — اطلب أي خدمة في ثوانٍ",
    description:
      "منصة شوفلي تربطك بأفضل مقدمي الخدمات والموردين المعتمدين في مصر.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "شوفلي — منصة الخدمات الذكية",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "شوفلي — اطلب أي خدمة في ثوانٍ",
    description: "اطلب خدمتك وتلقَّ عروض أسعار فورية من مئات المتخصصين.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#ff6a00",
  viewportFit: "cover",
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
      <body className="min-h-full font-tajawal bg-slate-50 text-foreground selection:bg-primary/20">
        <ThemeProvider>
          <div className="min-h-screen">
            {children}
            <SupportChatWidget />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
