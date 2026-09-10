import { requirePermission, hasPermission } from "@/features/identity/server";
import { NEWS_P } from "@/features/news";
import { NewsClient } from "./_components/news-client";

export default async function NewsPage() {
  const ctx = await requirePermission(NEWS_P.newsRead);

  return (
    <NewsClient
      canCreate={hasPermission(ctx, NEWS_P.newsCreate)}
      canReview={hasPermission(ctx, NEWS_P.newsReview)}
      canPin={hasPermission(ctx, NEWS_P.newsPin)}
      canManageAll={hasPermission(ctx, NEWS_P.newsManageAll)}
      canManageCategories={hasPermission(ctx, NEWS_P.newsManageCategories) || hasPermission(ctx, NEWS_P.newsManageAll)}
      currentUserId={ctx.userId}
    />
  );
}
