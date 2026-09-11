"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Eye, Pin, ArrowRight, Newspaper, PlayCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "@/shared/lib/i18n/client";
import type { NewsArticleDto, NewsCategoryDto } from "@/features/news";

interface PortalClientProps {
  initialCategories: NewsCategoryDto[];
  initialArticles: NewsArticleDto[];
  isFullArchivePage?: boolean;
}

export function PortalClient({
  initialCategories,
  initialArticles,
  isFullArchivePage = false,
}: PortalClientProps) {
  const locale = useLocale();
  const [selectedCat, setSelectedCat] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = isFullArchivePage ? 9 : 6;

  const filteredArticles = initialArticles.filter((a) => {
    const matchCat = selectedCat === "ALL" || a.categoryId === selectedCat;
    const title = (locale === "en" ? a.titleEn : a.titleTh).toLowerCase();
    const matchSearch = !search.trim() || title.includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedArticles = filteredArticles.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleCatChange = (catId: string) => {
    setSelectedCat(catId);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">


      {/* Main Content Area */}
      <main id="news-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-8 scroll-mt-6">
        {/* News Section Heading with More link */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 tracking-wider uppercase">
              {locale === "en" ? "Announcements & Updates" : "ข่าวสารและกิจกรรม"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1">
              {isFullArchivePage
                ? (locale === "en" ? "All Research News & Announcements" : "คลังข่าวสารและประกาศทั้งหมด")
                : (locale === "en" ? "Latest Research News & Public Relations" : "ข่าวสารงานวิจัยและประชาสัมพันธ์ล่าสุด")}
            </h2>
          </div>

          {!isFullArchivePage && (
            <Link
              href="/news-archive"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-semibold text-xs transition-colors border border-amber-500/30 shrink-0 self-start sm:self-auto shadow-xs"
            >
              <span>{locale === "en" ? "View all news (More...)" : "ดูข่าวทั้งหมด (More...)"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-5">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCatChange("ALL")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCat === "ALL"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800"
              }`}
            >
              {locale === "en" ? "All News" : "ข่าวสารทั้งหมด"}
            </button>
            {initialCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCatChange(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCat === cat.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800"
                }`}
              >
                {locale === "en" ? cat.nameEn : cat.nameTh}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="w-full md:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={locale === "en" ? "Search news..." : "ค้นหาข่าวสาร..."}
              className="w-full h-9 px-3 rounded-lg text-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* News Grid */}
        {filteredArticles.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Newspaper className="w-12 h-12 text-zinc-400 mx-auto stroke-1" />
            <p className="text-sm text-zinc-500">
              {locale === "en" ? "No articles found" : "ไม่พบข่าวสารในหมวดหมู่นี้"}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedArticles.map((art) => {
                const title = locale === "en" ? art.titleEn : art.titleTh;
                const summary = locale === "en" ? art.summaryEn || art.summaryTh : art.summaryTh;

                return (
                  <article
                    key={art.id}
                    className="group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col"
                  >
                    {/* Thumbnail / Cover */}
                    <Link href={`/article/${art.slug}`} className="relative block h-48 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                      {art.coverImageUrl ? (
                        <Image
                          src={art.coverImageUrl}
                          alt={title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <Newspaper className="w-10 h-10 stroke-1" />
                        </div>
                      )}
                      {art.isPinned && (
                        <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500 text-white shadow flex items-center gap-1">
                          <Pin className="w-3 h-3 fill-current" />
                          เด่น
                        </span>
                      )}
                      {art.youtubeUrl && (
                        <span className="absolute bottom-3 right-3 p-1.5 rounded-full bg-black/70 text-white shadow">
                          <PlayCircle className="w-5 h-5 text-red-500 fill-current" />
                        </span>
                      )}
                    </Link>

                    {/* Body Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {locale === "en" ? art.categoryNameEn : art.categoryNameTh}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(art.publishedAt)}
                          </span>
                        </div>

                        <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                          <Link href={`/article/${art.slug}`}>{title}</Link>
                        </h2>

                        {summary && (
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                            {summary}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Eye className="w-3.5 h-3.5" />
                          {art.viewCount} ครั้ง
                        </span>
                        <Link
                          href={`/article/${art.slug}`}
                          className="font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 text-xs"
                        >
                          อ่านต่อ &rarr;
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Page Navigation */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {locale === "en"
                    ? `Showing ${startIndex + 1} - ${Math.min(startIndex + ITEMS_PER_PAGE, filteredArticles.length)} of ${filteredArticles.length} articles`
                    : `แสดงข่าวที่ ${startIndex + 1} - ${Math.min(startIndex + ITEMS_PER_PAGE, filteredArticles.length)} จากทั้งหมด ${filteredArticles.length} รายการ`}
                </p>

                <div className="flex items-center gap-1.5">
                  {/* Prev Button */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-8 h-8 px-2 text-xs font-semibold rounded-lg transition-all ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white shadow-sm"
                          : "border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  {/* Next Button */}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-8 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} Faculty Web Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
