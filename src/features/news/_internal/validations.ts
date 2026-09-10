import { z } from "zod";

export const newsStatusEnum = z.enum([
  "DRAFT",
  "PENDING_REVIEW",
  "REVISION_REQUESTED",
  "PUBLISHED",
  "ARCHIVED",
]);

export const createNewsCategorySchema = z.object({
  nameTh: z.string().min(1).max(100),
  nameEn: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  colorBadge: z.string().max(50).optional().default("blue"),
  displayOrder: z.number().int().optional().default(0),
});

export const updateNewsCategorySchema = createNewsCategorySchema.extend({
  id: z.string().uuid(),
  isActive: z.boolean().optional().default(true),
});

export const createNewsArticleSchema = z.object({
  categoryId: z.string().uuid(),
  titleTh: z.string().min(1).max(255),
  titleEn: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  summaryTh: z.string().max(500).optional().nullable(),
  summaryEn: z.string().max(500).optional().nullable(),
  contentTh: z.string().min(1),
  contentEn: z.string().min(1),
  coverImageUrl: z.string().url().max(500).optional().nullable().or(z.literal("")),
  youtubeUrl: z.string().max(255).optional().nullable().or(z.literal("")),
  isPinned: z.boolean().optional().default(false),
  pinnedOrder: z.number().int().optional().default(0),
  publishedAt: z.string().datetime().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
});

export const updateNewsArticleSchema = createNewsArticleSchema.extend({
  id: z.string().uuid(),
});

export const reviewActionSchema = z.object({
  id: z.string().uuid(),
  revisionNotes: z.string().max(500).optional().nullable(),
});

export type CreateNewsCategoryInput = z.infer<typeof createNewsCategorySchema>;
export type UpdateNewsCategoryInput = z.infer<typeof updateNewsCategorySchema>;
export type CreateNewsArticleInput = z.infer<typeof createNewsArticleSchema>;
export type UpdateNewsArticleInput = z.infer<typeof updateNewsArticleSchema>;
export type ReviewActionInput = z.infer<typeof reviewActionSchema>;
