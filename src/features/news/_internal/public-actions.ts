"use server";

import { prisma } from "@/shared/lib/infra/prisma";
import { getPublishedNewsArticles, listNewsCategories, type NewsArticleDto, type NewsCategoryDto } from "./services";

export async function getPublicPortalDataAction(categorySlug?: string): Promise<{
  tenant: { nameTh: string; nameEn: string; logoUrl: string | null } | null;
  categories: NewsCategoryDto[];
  articles: NewsArticleDto[];
}> {
  const tenant = await prisma.tenant.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  if (!tenant) {
    return { tenant: null, categories: [], articles: [] };
  }

  const [categories, articles] = await Promise.all([
    listNewsCategories(tenant.id),
    getPublishedNewsArticles(tenant.id, categorySlug),
  ]);

  return {
    tenant: {
      nameTh: tenant.nameTh,
      nameEn: tenant.nameEn,
      logoUrl: tenant.logoUrl,
    },
    categories: categories.filter((c) => c.isActive),
    articles,
  };
}
