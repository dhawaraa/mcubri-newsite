import type { Metadata } from "next";
import { Inter, Sarabun } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { I18nProvider } from "@/shared/lib/i18n/client";
import { getT } from "@/i18n/server";
import { UI_MESSAGES } from "@/i18n";
import { getLocaleCookie } from "@/shared/lib/i18n/server";
import { DEFAULT_LOCALE } from "@/shared/lib/i18n/config";
import { auth, resolvePalette } from "@/features/identity/server";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "latin-ext"] });
const sarabun = Sarabun({ variable: "--font-sarabun", subsets: ["thai", "latin"], weight: ["300", "400", "500", "600", "700", "800"], display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("app.name"), description: t("app.tagline") };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [cookieLocale, palette, session] = await Promise.all([getLocaleCookie(), resolvePalette(), auth().catch(() => null)]);
  const locale = cookieLocale ?? session?.locale ?? DEFAULT_LOCALE; // spec B7: login จากเครื่องใหม่ได้ภาษาที่ผู้ใช้เคยเลือก
  return (
    <html lang={locale} data-palette={palette} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://db.onlinewebfonts.com/c/6e47ef470dd19698c911332a9b4d1cf4?family=Neue+Haas+Grotesk+Text+Pro" rel="stylesheet" />
        <link href="https://db.onlinewebfonts.com/c/dec0d9b4e22ca588dc20e1e2e09a59b5?family=Neue+Haas+Grotesk+Display+Pro+55+Roman" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${sarabun.variable} font-sans antialiased`} suppressHydrationWarning>
        <div className="bg" aria-hidden="true" />
        <I18nProvider locale={locale} messages={UI_MESSAGES}>
          <SessionProvider>
            <ThemeProvider attribute={["class", "data-theme"]} defaultTheme="light" enableSystem={false}>
              {children}
              <Toaster />
            </ThemeProvider>
          </SessionProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
