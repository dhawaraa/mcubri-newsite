"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { NEWS_P } from "../permissions";
import {
  createNewsCategorySchema,
  updateNewsCategorySchema,
  createNewsArticleSchema,
  updateNewsArticleSchema,
  reviewActionSchema,
} from "./validations";
import {
  listNewsCategories,
  createNewsCategory,
  updateNewsCategory,
  deleteNewsCategory,
  listNewsArticles,
  getNewsArticleById,
  createNewsArticle,
  updateNewsArticle,
  submitForReview,
  approveAndPublishArticle,
  requestArticleRevision,
  togglePinArticle,
  archiveArticle,
  deleteNewsArticle,
  type NewsCategoryDto,
  type NewsArticleDto,
} from "./services";
import type { NewsStatus } from "@/generated/prisma";

/* ================= หมวดหมู่ข่าว ================= */

export async function getNewsCategoriesAction(): Promise<ActionResult<NewsCategoryDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsRead);
    return listNewsCategories(ctx.tenantId);
  });
}

export async function createNewsCategoryAction(input: unknown): Promise<ActionResult<NewsCategoryDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManageCategories);
    const parsed = createNewsCategorySchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const res = await createNewsCategory(ctx.tenantId, parsed);
    revalidatePath("/news");
    return res;
  });
}

export async function updateNewsCategoryAction(input: unknown): Promise<ActionResult<NewsCategoryDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManageCategories);
    const parsed = updateNewsCategorySchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const res = await updateNewsCategory(ctx.tenantId, parsed);
    revalidatePath("/news");
    return res;
  });
}

export async function deleteNewsCategoryAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManageCategories);
    await deleteNewsCategory(ctx.tenantId, id);
    revalidatePath("/news");
  });
}

/* ================= ข่าวสาร & บทความ ================= */

export async function getNewsArticlesAction(filter?: {
  status?: NewsStatus;
  categoryId?: string;
  search?: string;
}): Promise<ActionResult<NewsArticleDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsRead);
    return listNewsArticles(ctx.tenantId, filter);
  });
}

export async function getNewsArticleAction(id: string): Promise<ActionResult<NewsArticleDto | null>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsRead);
    return getNewsArticleById(ctx.tenantId, id);
  });
}

export async function createNewsArticleAction(input: unknown): Promise<ActionResult<NewsArticleDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsCreate);
    const parsed = createNewsArticleSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const res = await createNewsArticle(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/news");
    return res;
  });
}

export async function updateNewsArticleAction(input: unknown): Promise<ActionResult<NewsArticleDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsCreate);
    const parsed = updateNewsArticleSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const res = await updateNewsArticle(ctx.tenantId, parsed);
    revalidatePath("/news");
    return res;
  });
}

export async function submitForReviewAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsCreate);
    await submitForReview(ctx.tenantId, id);
    revalidatePath("/news");
  });
}

export async function approveAndPublishAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsReview);
    await approveAndPublishArticle(ctx.tenantId, ctx.userId, id);
    revalidatePath("/news");
  });
}

export async function requestRevisionAction(input: unknown): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsReview);
    const parsed = reviewActionSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    await requestArticleRevision(ctx.tenantId, ctx.userId, parsed.id, parsed.revisionNotes || "");
    revalidatePath("/news");
  });
}

export async function togglePinAction(id: string, isPinned: boolean): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsPin);
    await togglePinArticle(ctx.tenantId, id, isPinned);
    revalidatePath("/news");
  });
}

export async function archiveArticleAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsReview);
    await archiveArticle(ctx.tenantId, id);
    revalidatePath("/news");
  });
}

export async function deleteNewsArticleAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(NEWS_P.newsManageAll);
    await deleteNewsArticle(ctx.tenantId, id);
    revalidatePath("/news");
  });
}
