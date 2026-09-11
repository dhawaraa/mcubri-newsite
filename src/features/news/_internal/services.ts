import { prisma } from "@/shared/lib/infra/prisma";
import type {
  CreateNewsCategoryInput,
  UpdateNewsCategoryInput,
  CreateNewsArticleInput,
  UpdateNewsArticleInput,
} from "./validations";
import type { NewsStatus, Prisma } from "@/generated/prisma";

export interface NewsCategoryDto {
  id: string;
  tenantId: string;
  nameTh: string;
  nameEn: string;
  slug: string;
  colorBadge: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewsArticleDto {
  id: string;
  tenantId: string;
  categoryId: string;
  categoryNameTh?: string;
  categoryNameEn?: string;
  categorySlug?: string;
  colorBadge?: string | null;
  authorId: string;
  authorName?: string;
  reviewedById: string | null;
  reviewedByName?: string | null;
  titleTh: string;
  titleEn: string;
  slug: string;
  summaryTh: string | null;
  summaryEn: string | null;
  contentTh: string;
  contentEn: string;
  coverImageUrl: string | null;
  youtubeUrl: string | null;
  status: NewsStatus;
  revisionNotes: string | null;
  isPinned: boolean;
  pinnedOrder: number;
  publishedAt: string | null;
  expiresAt: string | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

/* ================= หมวดหมู่ข่าว (Categories) ================= */

export async function listNewsCategories(tenantId: string): Promise<NewsCategoryDto[]> {
  const categories = await prisma.newsCategory.findMany({
    where: { tenantId },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });

  return categories.map((c) => ({
    id: c.id,
    tenantId: c.tenantId,
    nameTh: c.nameTh,
    nameEn: c.nameEn,
    slug: c.slug,
    colorBadge: c.colorBadge,
    displayOrder: c.displayOrder,
    isActive: c.isActive,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));
}

export async function createNewsCategory(tenantId: string, input: CreateNewsCategoryInput): Promise<NewsCategoryDto> {
  const c = await prisma.newsCategory.create({
    data: {
      tenantId,
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      slug: input.slug,
      colorBadge: input.colorBadge,
      displayOrder: input.displayOrder ?? 0,
    },
  });

  return {
    id: c.id,
    tenantId: c.tenantId,
    nameTh: c.nameTh,
    nameEn: c.nameEn,
    slug: c.slug,
    colorBadge: c.colorBadge,
    displayOrder: c.displayOrder,
    isActive: c.isActive,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export async function updateNewsCategory(tenantId: string, input: UpdateNewsCategoryInput): Promise<NewsCategoryDto> {
  const c = await prisma.newsCategory.update({
    where: { id: input.id, tenantId },
    data: {
      nameTh: input.nameTh,
      nameEn: input.nameEn,
      slug: input.slug,
      colorBadge: input.colorBadge,
      displayOrder: input.displayOrder,
      isActive: input.isActive,
    },
  });

  return {
    id: c.id,
    tenantId: c.tenantId,
    nameTh: c.nameTh,
    nameEn: c.nameEn,
    slug: c.slug,
    colorBadge: c.colorBadge,
    displayOrder: c.displayOrder,
    isActive: c.isActive,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

export async function deleteNewsCategory(tenantId: string, id: string): Promise<void> {
  await prisma.newsCategory.delete({
    where: { id, tenantId },
  });
}

/* ================= บทความข่าว (Articles) ================= */

export async function listNewsArticles(
  tenantId: string,
  filter?: { status?: NewsStatus; categoryId?: string; search?: string }
): Promise<NewsArticleDto[]> {
  const where: Prisma.NewsArticleWhereInput = { tenantId };
  if (filter?.status) where.status = filter.status;
  if (filter?.categoryId) where.categoryId = filter.categoryId;
  if (filter?.search) {
    where.OR = [
      { titleTh: { contains: filter.search, mode: "insensitive" } },
      { titleEn: { contains: filter.search, mode: "insensitive" } },
    ];
  }

  const articles = await prisma.newsArticle.findMany({
    where,
    include: {
      category: { select: { nameTh: true, nameEn: true, slug: true, colorBadge: true } },
      author: { select: { name: true } },
      reviewedBy: { select: { name: true } },
    },
    orderBy: [
      { isPinned: "desc" },
      { pinnedOrder: "asc" },
      { createdAt: "desc" },
    ],
  });

  return articles.map((a) => ({
    id: a.id,
    tenantId: a.tenantId,
    categoryId: a.categoryId,
    categoryNameTh: a.category.nameTh,
    categoryNameEn: a.category.nameEn,
    categorySlug: a.category.slug,
    colorBadge: a.category.colorBadge,
    authorId: a.authorId,
    authorName: a.author.name,
    reviewedById: a.reviewedById,
    reviewedByName: a.reviewedBy?.name ?? null,
    titleTh: a.titleTh,
    titleEn: a.titleEn,
    slug: a.slug,
    summaryTh: a.summaryTh,
    summaryEn: a.summaryEn,
    contentTh: a.contentTh,
    contentEn: a.contentEn,
    coverImageUrl: a.coverImageUrl,
    youtubeUrl: a.youtubeUrl,
    status: a.status,
    revisionNotes: a.revisionNotes,
    isPinned: a.isPinned,
    pinnedOrder: a.pinnedOrder,
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
    expiresAt: a.expiresAt ? a.expiresAt.toISOString() : null,
    viewCount: a.viewCount,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }));
}

export async function getNewsArticleById(tenantId: string, id: string): Promise<NewsArticleDto | null> {
  const a = await prisma.newsArticle.findUnique({
    where: { id, tenantId },
    include: {
      category: { select: { nameTh: true, nameEn: true, slug: true, colorBadge: true } },
      author: { select: { name: true } },
      reviewedBy: { select: { name: true } },
    },
  });
  if (!a) return null;

  return {
    id: a.id,
    tenantId: a.tenantId,
    categoryId: a.categoryId,
    categoryNameTh: a.category.nameTh,
    categoryNameEn: a.category.nameEn,
    categorySlug: a.category.slug,
    colorBadge: a.category.colorBadge,
    authorId: a.authorId,
    authorName: a.author.name,
    reviewedById: a.reviewedById,
    reviewedByName: a.reviewedBy?.name ?? null,
    titleTh: a.titleTh,
    titleEn: a.titleEn,
    slug: a.slug,
    summaryTh: a.summaryTh,
    summaryEn: a.summaryEn,
    contentTh: a.contentTh,
    contentEn: a.contentEn,
    coverImageUrl: a.coverImageUrl,
    youtubeUrl: a.youtubeUrl,
    status: a.status,
    revisionNotes: a.revisionNotes,
    isPinned: a.isPinned,
    pinnedOrder: a.pinnedOrder,
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
    expiresAt: a.expiresAt ? a.expiresAt.toISOString() : null,
    viewCount: a.viewCount,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

export async function createNewsArticle(
  tenantId: string,
  authorId: string,
  input: CreateNewsArticleInput
): Promise<NewsArticleDto> {
  const created = await prisma.newsArticle.create({
    data: {
      tenantId,
      authorId,
      categoryId: input.categoryId,
      titleTh: input.titleTh,
      titleEn: input.titleEn,
      slug: input.slug,
      summaryTh: input.summaryTh ?? null,
      summaryEn: input.summaryEn ?? null,
      contentTh: input.contentTh,
      contentEn: input.contentEn,
      coverImageUrl: input.coverImageUrl || null,
      youtubeUrl: input.youtubeUrl || null,
      isPinned: input.isPinned ?? false,
      pinnedOrder: input.pinnedOrder ?? 0,
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      status: "DRAFT",
    },
    include: {
      category: { select: { nameTh: true, nameEn: true, slug: true, colorBadge: true } },
      author: { select: { name: true } },
    },
  });

  return {
    id: created.id,
    tenantId: created.tenantId,
    categoryId: created.categoryId,
    categoryNameTh: created.category.nameTh,
    categoryNameEn: created.category.nameEn,
    categorySlug: created.category.slug,
    colorBadge: created.category.colorBadge,
    authorId: created.authorId,
    authorName: created.author.name,
    reviewedById: null,
    reviewedByName: null,
    titleTh: created.titleTh,
    titleEn: created.titleEn,
    slug: created.slug,
    summaryTh: created.summaryTh,
    summaryEn: created.summaryEn,
    contentTh: created.contentTh,
    contentEn: created.contentEn,
    coverImageUrl: created.coverImageUrl,
    youtubeUrl: created.youtubeUrl,
    status: created.status,
    revisionNotes: created.revisionNotes,
    isPinned: created.isPinned,
    pinnedOrder: created.pinnedOrder,
    publishedAt: created.publishedAt ? created.publishedAt.toISOString() : null,
    expiresAt: created.expiresAt ? created.expiresAt.toISOString() : null,
    viewCount: created.viewCount,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  };
}

export async function updateNewsArticle(
  tenantId: string,
  input: UpdateNewsArticleInput
): Promise<NewsArticleDto> {
  const updated = await prisma.newsArticle.update({
    where: { id: input.id, tenantId },
    data: {
      categoryId: input.categoryId,
      titleTh: input.titleTh,
      titleEn: input.titleEn,
      slug: input.slug,
      summaryTh: input.summaryTh ?? null,
      summaryEn: input.summaryEn ?? null,
      contentTh: input.contentTh,
      contentEn: input.contentEn,
      coverImageUrl: input.coverImageUrl || null,
      youtubeUrl: input.youtubeUrl || null,
      isPinned: input.isPinned ?? false,
      pinnedOrder: input.pinnedOrder ?? 0,
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    },
    include: {
      category: { select: { nameTh: true, nameEn: true, slug: true, colorBadge: true } },
      author: { select: { name: true } },
      reviewedBy: { select: { name: true } },
    },
  });

  return {
    id: updated.id,
    tenantId: updated.tenantId,
    categoryId: updated.categoryId,
    categoryNameTh: updated.category.nameTh,
    categoryNameEn: updated.category.nameEn,
    categorySlug: updated.category.slug,
    colorBadge: updated.category.colorBadge,
    authorId: updated.authorId,
    authorName: updated.author.name,
    reviewedById: updated.reviewedById,
    reviewedByName: updated.reviewedBy?.name ?? null,
    titleTh: updated.titleTh,
    titleEn: updated.titleEn,
    slug: updated.slug,
    summaryTh: updated.summaryTh,
    summaryEn: updated.summaryEn,
    contentTh: updated.contentTh,
    contentEn: updated.contentEn,
    coverImageUrl: updated.coverImageUrl,
    youtubeUrl: updated.youtubeUrl,
    status: updated.status,
    revisionNotes: updated.revisionNotes,
    isPinned: updated.isPinned,
    pinnedOrder: updated.pinnedOrder,
    publishedAt: updated.publishedAt ? updated.publishedAt.toISOString() : null,
    expiresAt: updated.expiresAt ? updated.expiresAt.toISOString() : null,
    viewCount: updated.viewCount,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

export async function submitForReview(tenantId: string, id: string): Promise<void> {
  await prisma.newsArticle.update({
    where: { id, tenantId },
    data: { status: "PENDING_REVIEW" },
  });
}

export async function approveAndPublishArticle(
  tenantId: string,
  reviewerId: string,
  id: string
): Promise<void> {
  await prisma.newsArticle.update({
    where: { id, tenantId },
    data: {
      status: "PUBLISHED",
      reviewedById: reviewerId,
      publishedAt: new Date(),
      revisionNotes: null,
    },
  });
}

export async function requestArticleRevision(
  tenantId: string,
  reviewerId: string,
  id: string,
  notes: string
): Promise<void> {
  await prisma.newsArticle.update({
    where: { id, tenantId },
    data: {
      status: "REVISION_REQUESTED",
      reviewedById: reviewerId,
      revisionNotes: notes,
    },
  });
}

export async function togglePinArticle(tenantId: string, id: string, isPinned: boolean): Promise<void> {
  await prisma.newsArticle.update({
    where: { id, tenantId },
    data: { isPinned },
  });
}

export async function archiveArticle(tenantId: string, id: string): Promise<void> {
  await prisma.newsArticle.update({
    where: { id, tenantId },
    data: { status: "ARCHIVED" },
  });
}

export async function deleteNewsArticle(tenantId: string, id: string): Promise<void> {
  await prisma.newsArticle.delete({
    where: { id, tenantId },
  });
}

/* ================= Public Queries (หน้า Portal) ================= */

export async function getPublishedNewsArticles(
  tenantId: string,
  categorySlug?: string
): Promise<NewsArticleDto[]> {
  const now = new Date();
  const where: Prisma.NewsArticleWhereInput = {
    tenantId,
    status: "PUBLISHED",
    publishedAt: { lte: now },
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
  };

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  const articles = await prisma.newsArticle.findMany({
    where,
    include: {
      category: { select: { nameTh: true, nameEn: true, slug: true, colorBadge: true } },
      author: { select: { name: true } },
    },
    orderBy: [
      { isPinned: "desc" },
      { pinnedOrder: "asc" },
      { publishedAt: "desc" },
    ],
  });

  return articles.map((a) => ({
    id: a.id,
    tenantId: a.tenantId,
    categoryId: a.categoryId,
    categoryNameTh: a.category.nameTh,
    categoryNameEn: a.category.nameEn,
    categorySlug: a.category.slug,
    colorBadge: a.category.colorBadge,
    authorId: a.authorId,
    authorName: a.author.name,
    reviewedById: null,
    titleTh: a.titleTh,
    titleEn: a.titleEn,
    slug: a.slug,
    summaryTh: a.summaryTh,
    summaryEn: a.summaryEn,
    contentTh: a.contentTh,
    contentEn: a.contentEn,
    coverImageUrl: a.coverImageUrl,
    youtubeUrl: a.youtubeUrl,
    status: a.status,
    revisionNotes: null,
    isPinned: a.isPinned,
    pinnedOrder: a.pinnedOrder,
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
    expiresAt: a.expiresAt ? a.expiresAt.toISOString() : null,
    viewCount: a.viewCount,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }));
}

export async function getPublicArticleBySlug(
  tenantId: string,
  slug: string
): Promise<NewsArticleDto | null> {
  const now = new Date();
  const a = await prisma.newsArticle.findFirst({
    where: {
      tenantId,
      slug,
      status: "PUBLISHED",
      publishedAt: { lte: now },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    include: {
      category: { select: { nameTh: true, nameEn: true, slug: true, colorBadge: true } },
      author: { select: { name: true } },
    },
  });

  if (!a) return null;

  // เพิ่มยอดวิวแบบอะซิงโครนัส
  prisma.newsArticle.update({
    where: { id: a.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});

  return {
    id: a.id,
    tenantId: a.tenantId,
    categoryId: a.categoryId,
    categoryNameTh: a.category.nameTh,
    categoryNameEn: a.category.nameEn,
    categorySlug: a.category.slug,
    colorBadge: a.category.colorBadge,
    authorId: a.authorId,
    authorName: a.author.name,
    reviewedById: null,
    titleTh: a.titleTh,
    titleEn: a.titleEn,
    slug: a.slug,
    summaryTh: a.summaryTh,
    summaryEn: a.summaryEn,
    contentTh: a.contentTh,
    contentEn: a.contentEn,
    coverImageUrl: a.coverImageUrl,
    youtubeUrl: a.youtubeUrl,
    status: a.status,
    revisionNotes: null,
    isPinned: a.isPinned,
    pinnedOrder: a.pinnedOrder,
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
    expiresAt: a.expiresAt ? a.expiresAt.toISOString() : null,
    viewCount: a.viewCount + 1,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}
