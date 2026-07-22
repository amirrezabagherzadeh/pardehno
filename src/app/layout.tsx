import type { Metadata } from "next";
import { Suspense } from "react";
import "@fontsource-variable/vazirmatn";
import { DirectionProvider } from "@/components/ui/direction";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | کشف فیلم و سریال`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: siteConfig.name,
    title: `${siteConfig.name} | کشف فیلم و سریال`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | کشف فیلم و سریال`,
    description: siteConfig.description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className="dark antialiased" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <DirectionProvider dir="rtl">
          <TooltipProvider delayDuration={250}>
            <Suspense fallback={<div className="fixed inset-x-0 top-0 z-40 h-14 md:h-[68px]" />}>
              <SiteHeader />
            </Suspense>
            <main className="min-h-screen">{children}</main>
            <SiteFooter />
          </TooltipProvider>
        </DirectionProvider>
      </body>
    </html>
  );
}
