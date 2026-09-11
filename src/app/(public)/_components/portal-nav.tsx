"use client";

import Link from "next/link";
import { GraduationCap, LogIn, Globe } from "lucide-react";
import { useLocale } from "@/shared/lib/i18n/client";
import { setLocaleAction } from "@/features/identity/actions";

interface PortalNavProps {
  tenantNameTh?: string;
  tenantNameEn?: string;
}

export function PortalNav({ tenantNameTh: _tenantNameTh, tenantNameEn: _tenantNameEn }: PortalNavProps) {
  const locale = useLocale();

  const toggleLanguage = async () => {
    const nextLocale = locale === "th" ? "en" : "th";
    await setLocaleAction(nextLocale);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 dark:bg-zinc-950/85 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-base sm:text-lg tracking-tight text-zinc-900 dark:text-zinc-100 block leading-tight">
              {locale === "en" ? "Buddhist Research Institute (BRI-MCU)" : "สถาบันวิจัยพุทธศาสตร์ มจร"}
            </span>
          </div>
        </Link>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-4">
          <nav className="hidden sm:flex items-center gap-1">
            <Link
              href="/news-archive"
              className="px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {locale === "en" ? "News & Announcements" : "ข่าวสารและประกาศ"}
            </Link>
            <Link
              href="/staff"
              className="px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {locale === "en" ? "Personnel" : "ทำเนียบบุคลากร"}
            </Link>
          </nav>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-200 dark:border-zinc-800"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            <span>{locale === "th" ? "EN" : "ไทย"}</span>
          </button>

          {/* Admin Login Button */}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 rounded-lg transition-all shadow-sm"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>เข้าสู่ระบบเจ้าหน้าที่</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
