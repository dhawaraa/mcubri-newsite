"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LogIn, Sparkles, Menu, X, Globe, GraduationCap, ChevronLeft, ChevronRight, Compass } from "lucide-react";
import { useLocale } from "@/shared/lib/i18n/client";
import { setLocaleAction } from "@/features/identity/actions";

const HERO_IMAGES = [
  {
    src: "/images/hero/hero-1.jpg",
    titleTh: "พระอุโบสถกลางน้ำ มจร",
    titleEn: "Water Ubosot of MCU",
    tagTh: "พุทธศาสนสถาปัตยกรรม",
    tagEn: "Buddhist Architecture",
  },
  {
    src: "/images/hero/hero-2.jpg",
    titleTh: "ทัศนียภาพ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย",
    titleEn: "Mahachulalongkornrajavidyalaya Campus",
    tagTh: "ศูนย์กลางการศึกษาพระพุทธศาสนา",
    tagEn: "Global Buddhist Education Hub",
  },
  {
    src: "/images/hero/hero-3.jpg",
    titleTh: "อาคารเรียนรวมและศูนย์การประชุมนานาชาติ มจร",
    titleEn: "MCU Academic & International Center",
    tagTh: "การวิจัยและบริการวิชาการ",
    tagEn: "Academic Excellence & Research",
  },
  {
    src: "/images/hero/hero-4.jpg",
    titleTh: "พระบรมราชานุสาวรีย์ ร.๕ องค์พระราชทานกำเนิด มจร",
    titleEn: "King Rama V Founder Monument",
    tagTh: "พระผู้พระราชทานกำเนิดสถาบัน",
    tagEn: "Royal Founder Tribute",
  },
];

interface VexHeroProps {
  tenantNameTh?: string;
  tenantNameEn?: string;
}

export function VexHero({ tenantNameTh, tenantNameEn }: VexHeroProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const locale = useLocale();

  // Auto-advance slides with a smooth 6.5s interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const toggleLanguage = async () => {
    const nextLocale = locale === "th" ? "en" : "th";
    await setLocaleAction(nextLocale);
  };

  const navLinks = [
    {
      href: "/news-archive",
      labelTh: "ข่าวสารและประกาศ",
      labelEn: "News & Announcements",
    },
    {
      href: "/staff",
      labelTh: "ทำเนียบบุคลากร",
      labelEn: "Personnel Directory",
    },
    {
      href: "#news-section",
      labelTh: "คลังงานวิจัย",
      labelEn: "Research Database",
    },
  ];

  return (
    <section className="relative w-full min-h-screen sm:h-screen overflow-hidden bg-[#1f2a1d] text-[#1f2a1d]">
      {/* 1. Full-screen Photo Background Slider with Soft Ken-Burns Zoom */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        {HERO_IMAGES.map((img, idx) => {
          const isActive = idx === currentSlide;
          return (
            <div
              key={img.src}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <img
                src={img.src}
                alt={locale === "en" ? img.titleEn : img.titleTh}
                className={`w-full h-full object-cover transition-transform duration-[7000ms] ease-out ${
                  isActive ? "scale-105" : "scale-100"
                }`}
              />
            </div>
          );
        })}

        {/* Harmonized Editorial Overlays: Keeps photos lush & texts ultra-readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/20 to-black/60 pointer-events-none" />
      </div>

      {/* 2. Top Navigation Bar (LinkFlow pill-bar layout) */}
      <nav className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-6 md:px-10 py-4 sm:py-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#1f2a1d] text-white flex items-center justify-center shadow-md shadow-[#1f2a1d]/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="flex items-center gap-1.5 text-[#2d3a2a]">
            <span
              className="text-base sm:text-lg md:text-xl font-semibold tracking-tight leading-tight group-hover:text-[#336443] transition-colors"
              style={{
                fontFamily:
                  '"Neue Haas Grotesk Display Pro 55 Roman", "Neue Haas Grotesk Text Pro", "Helvetica Neue", Helvetica, Arial, sans-serif',
              }}
            >
              {locale === "en" ? "BRI-MCU" : "สถาบันวิจัยพุทธศาสตร์ มจร"}
            </span>
          </div>
        </Link>

        {/* Center Pill Menu for Desktop */}
        <div className="hidden lg:flex items-center gap-1 bg-white/80 backdrop-blur-md rounded-full pl-6 pr-1.5 py-1 shadow-sm border border-white/70">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm px-3.5 py-2 transition-colors ${
                i === 0
                  ? "font-semibold text-[#1f2a1d]"
                  : "font-medium text-[#4b5b47] hover:text-[#1f2a1d]"
              }`}
            >
              {locale === "en" ? link.labelEn : link.labelTh}
            </Link>
          ))}
          <Link
            href="#news-section"
            className="ml-2 bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors inline-block shadow-sm"
          >
            {locale === "en" ? "Explore Research" : "สืบค้นงานวิจัย"}
          </Link>
        </div>

        {/* Right Action Icons: Language Toggle + Staff Login + Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-4 text-[#2d3a2a]">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1f2a1d] bg-white/80 hover:bg-white rounded-full border border-white/70 transition-colors shadow-sm"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#336443]" />
            <span>{locale === "th" ? "EN" : "ไทย"}</span>
          </button>

          {/* Staff Login Button */}
          <Link
            href="/login"
            className="hidden sm:flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity bg-white/85 hover:bg-white px-4 py-2 rounded-full border border-white/70 text-[#1f2a1d] shadow-sm"
          >
            <LogIn className="w-4 h-4 text-[#336443]" />
            <span>{locale === "en" ? "Staff Portal" : "เข้าสู่ระบบ"}</span>
          </Link>

          {/* Mobile Menu Hamburger / Close Button */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden relative flex items-center justify-center w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-white/70 text-[#1f2a1d] transition-all duration-300 hover:bg-white/95"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <Menu
              className={`w-5 h-5 absolute transition-all duration-300 ${
                menuOpen ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
              }`}
            />
            <X
              className={`w-5 h-5 absolute transition-all duration-300 ${
                menuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      >
        <div className="absolute inset-0 bg-[#1f2a1d]/50 backdrop-blur-sm" />
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={`lg:hidden fixed top-0 right-0 bottom-0 z-50 w-[85%] max-w-sm bg-white/95 backdrop-blur-xl shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full pt-20 px-8 pb-8">
          <div className="flex flex-col gap-1">
            {navLinks.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`text-xl font-semibold text-[#1f2a1d] py-3.5 border-b border-[#1f2a1d]/10 transition-all duration-500 ${
                  menuOpen ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
                }`}
                style={{ transitionDelay: menuOpen ? `${150 + i * 70}ms` : "0ms" }}
              >
                {locale === "en" ? link.labelEn : link.labelTh}
              </Link>
            ))}
          </div>

          <div
            className={`mt-8 flex flex-col gap-4 transition-all duration-500 ${
              menuOpen ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
            }`}
            style={{ transitionDelay: menuOpen ? "400ms" : "0ms" }}
          >
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 text-sm font-medium text-[#2d3a2a]"
            >
              <LogIn className="w-4 h-4 text-[#336443]" />
              {locale === "en" ? "Staff Portal" : "เข้าสู่ระบบเจ้าหน้าที่"}
            </Link>
            <Link
              href="#news-section"
              onClick={() => setMenuOpen(false)}
              className="mt-2 bg-[#1f2a1d] hover:bg-[#2a3827] text-white text-center text-sm font-semibold px-5 py-3 rounded-full transition-colors"
            >
              {locale === "en" ? "Explore Research" : "สืบค้นงานวิจัยและข่าวสาร"}
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Hero Copy (Centered with Neue Haas Grotesk & green palette) */}
      <div className="relative z-10 flex flex-col items-center text-center pt-28 sm:pt-32 md:pt-36 px-4 sm:px-6">
        <h1
          className="font-normal text-[#1f2a1d] text-[2rem] sm:text-4xl md:text-5xl lg:text-[4.25rem] xl:text-[4.75rem] max-w-5xl tracking-tight drop-shadow-sm leading-tight sm:leading-[1.15] lg:leading-[1.18]"
          style={{
            fontFamily:
              '"Neue Haas Grotesk Display Pro 55 Roman", "Neue Haas Grotesk Text Pro", "Helvetica Neue", Helvetica, Arial, sans-serif',
          }}
        >
          {locale === "en" ? (
            <>
              <span className="block">Harmonizing Buddhist Wisdom</span>
              <span className="block text-[#336443] font-medium mt-1 sm:mt-2">
                with Sustainable Innovation
              </span>
            </>
          ) : (
            <>
              <span className="block">บูรณาการพุทธปัญญา</span>
              <span className="block text-[#336443] font-medium mt-1 sm:mt-2">
                สู่นวัตกรรมเพื่อสังคมสุขภาวะ
              </span>
            </>
          )}
        </h1>
        <p className="mt-5 sm:mt-7 text-[#1f2a1d]/85 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl px-2 font-medium drop-shadow-sm">
          {locale === "en"
            ? "Pioneering Buddhist research, academic excellence, and transformative wisdom for holistic societal well-being."
            : "ศูนย์กลางการวิจัย การสร้างสรรค์องค์ความรู้ และการบริการวิชาการทางพระพุทธศาสนา เพื่อการพัฒนาจิตใจ ชุมชน และสังคมอย่างยั่งยืน"}
        </p>
      </div>

      {/* 4. Bottom-left CTA Card Block */}
      <div className="absolute left-4 right-4 sm:right-auto sm:left-6 md:left-10 bottom-6 sm:bottom-8 md:bottom-10 z-10 max-w-sm">
        <div className="flex items-center gap-2 text-white mb-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold tracking-wide">
            {locale === "en" ? "Buddhist Research Institute" : "สถาบันวิจัยพุทธศาสตร์"}
            <sup className="text-[10px] ml-0.5 text-amber-300">MCU</sup>
          </span>
        </div>
        <p className="text-white/90 text-xs leading-relaxed mb-4 max-w-xs font-normal">
          {locale === "en"
            ? "BRI-MCU smoothly bridges profound Buddhist canonical wisdom with contemporary science and community empowerment."
            : "สถาบันวิจัยพุทธศาสตร์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย มุ่งเน้นสร้างงานวิจัยคุณภาพเพื่อรับใช้สังคมและพระพุทธศาสนา"}
        </p>
        <div className="flex items-center gap-3.5 flex-wrap">
          <Link
            href="#news-section"
            className="bg-white hover:bg-white/90 text-[#1f2a1d] text-sm font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-full transition-colors shadow-lg inline-block"
          >
            {locale === "en" ? "Explore Research" : "สืบค้นงานวิจัย"}
          </Link>
          <Link
            href="/staff"
            className="text-white text-sm font-semibold hover:text-amber-300 transition-colors inline-block underline underline-offset-4 decoration-white/40 hover:decoration-amber-300"
          >
            {locale === "en" ? "Faculty & Researchers" : "ทำเนียบบุคลากร"}
          </Link>
        </div>
      </div>

      {/* 5. Bottom-right Slide Switcher & Location Badge */}
      <div className="hidden sm:flex absolute right-6 md:right-10 bottom-8 md:bottom-10 z-10 flex-col items-end gap-2.5">
        <div className="flex items-center gap-2 text-white/90 text-xs bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-medium">
            {locale === "en" ? HERO_IMAGES[currentSlide].titleEn : HERO_IMAGES[currentSlide].titleTh}
          </span>
        </div>
        {/* Slide Indicators with controls */}
        <div className="flex items-center gap-1.5">
          {HERO_IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? "w-7 bg-white shadow-sm"
                  : "w-2 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
