import type { PermissionDef } from "@/shared/lib/permission-def";

export const NEWS_P = {
  newsRead: "news:read",
  newsCreate: "news:create",
  newsReview: "news:review",
  newsPin: "news:pin",
  newsManageCategories: "news:manage_categories",
  newsManageAll: "news:manage_all",
} as const;

export const NEWS_PERMISSIONS: readonly PermissionDef[] = [
  { code: NEWS_P.newsRead, module: "news", action: "read", description: "อ่านและดูรายการข่าวสาร" },
  { code: NEWS_P.newsCreate, module: "news", action: "create", description: "สร้างและแก้ไขร่างข่าวของตนเอง" },
  { code: NEWS_P.newsReview, module: "news", action: "review", description: "ตรวจทาน สั่งแก้ไข และอนุมัติเผยแพร่ข่าว" },
  { code: NEWS_P.newsPin, module: "news", action: "pin", description: "ปักหมุดข่าวเด่นบนหน้าแรก" },
  { code: NEWS_P.newsManageCategories, module: "news", action: "manage_categories", description: "จัดการหมวดหมู่ข่าวสาร" },
  { code: NEWS_P.newsManageAll, module: "news", action: "manage_all", description: "จัดการข่าวสารทั้งหมดในระบบ" },
];
