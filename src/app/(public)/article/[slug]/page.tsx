import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, Eye, Tag } from "lucide-react";
import { prisma } from "@/shared/lib/infra/prisma";
import { getPublicArticleBySlug, getPublishedNewsArticles } from "@/features/news/server";
import { getLocale } from "@/shared/lib/i18n/server";
import { PortalNav } from "../../_components/portal-nav";

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { slug } = await params;
  const locale = await getLocale();

  const tenant = await prisma.tenant.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  if (!tenant) notFound();

  const article = await getPublicArticleBySlug(tenant.id, slug);
  if (!article) notFound();

  const title = locale === "en" ? article.titleEn : article.titleTh;
  const summary = locale === "en" ? article.summaryEn || article.summaryTh : article.summaryTh;
  const content = locale === "en" ? article.contentEn || article.contentTh : article.contentTh;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // ดึง YouTube Embed ID หากมี
  const getYouTubeEmbedUrl = (url: string | null) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const youtubeEmbed = getYouTubeEmbedUrl(article.youtubeUrl);

  const relatedArticles = await getPublishedNewsArticles(tenant.id);
  const otherNews = relatedArticles.filter((a) => a.id !== article.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      <PortalNav tenantNameTh={tenant.nameTh} tenantNameEn={tenant.nameEn} />

      {/* Full width container matching the portal width */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 flex-1 w-full space-y-8">
        {/* Breadcrumb / Back Link */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับสู่หน้าหลักข่าวสาร</span>
          </Link>
          <span className="text-xs text-zinc-400">
            {locale === "en" ? article.categoryNameEn : article.categoryNameTh}
          </span>
        </div>

        {/* 2-Column Grid Layout: Main Article (Left) + Sidebar (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Article Content (8 Cols) */}
          <article className="lg:col-span-8 space-y-6">
            <header className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="inline-flex items-center gap-1 font-semibold px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                  <Tag className="w-3 h-3" />
                  {locale === "en" ? article.categoryNameEn : article.categoryNameTh}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(article.publishedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {article.viewCount} ครั้ง
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
                {title}
              </h1>

              {summary && (
                <div className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium bg-blue-50/50 dark:bg-blue-950/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                  {summary}
                </div>
              )}
            </header>

            {/* Cover Image (Full Width of Column) */}
            {article.coverImageUrl && (
              <div className="relative rounded-2xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800 aspect-video bg-zinc-100 dark:bg-zinc-900">
                <Image
                  src={article.coverImageUrl}
                  alt={title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 800px"
                />
              </div>
            )}

            {/* YouTube Video (if present) */}
            {youtubeEmbed && (
              <div className="rounded-2xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800 aspect-video">
                <iframe
                  src={youtubeEmbed}
                  title="YouTube video player"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* Content Body */}
            <div className="text-zinc-800 dark:text-zinc-200 text-base sm:text-lg leading-relaxed whitespace-pre-line py-4 space-y-4">
              {content}
            </div>

            {/* Author Footer Card */}
            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-700 dark:text-zinc-300">
                  {article.authorName?.[0] || "A"}
                </span>
                <div>
                  <span className="block text-zinc-400 text-[11px]">ผู้เขียน/เผยแพร่</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {article.authorName}
                  </span>
                </div>
              </div>
              <Link
                href="/"
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 text-xs"
              >
                ดูข่าวสารทั้งหมด &rarr;
              </Link>
            </div>
          </article>

          {/* Sidebar (4 Cols) - ข่าวสารอื่นๆ ที่น่าสนใจ */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs space-y-4 sticky top-24">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <Tag className="w-4 h-4 text-blue-500" />
                <span>ข่าวสารอื่นๆ ที่น่าสนใจ</span>
              </h3>

              <div className="space-y-4">
                {otherNews.map((other) => (
                  <Link
                    key={other.id}
                    href={`/article/${other.slug}`}
                    className="group block space-y-1.5 pb-3 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {locale === "en" ? other.categoryNameEn : other.categoryNameTh}
                      </span>
                      <span>•</span>
                      <span>{formatDate(other.publishedAt)}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                      {locale === "en" ? other.titleEn : other.titleTh}
                    </h4>
                  </Link>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  href="/"
                  className="block text-center w-full py-2 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 text-xs font-semibold rounded-xl text-zinc-600 dark:text-zinc-300 transition-colors"
                >
                  ไปยังหน้ารวมข่าวทั้งหมด
                </Link>
              </div>
            </div>
          </aside>
        </div>
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
