export const newsMessages = {
  // Navigation & Page Titles
  "news.title": { th: "ข่าวสารประชาสัมพันธ์", en: "News & Announcements" },
  "news.subtitle": { th: "จัดการข่าวสาร บทความวิชาการ และประกาศของคณะ", en: "Manage faculty news, academic articles, and announcements" },
  "news.create": { th: "เขียนข่าวใหม่", en: "Create Article" },
  "news.edit": { th: "แก้ไขข่าวสาร", en: "Edit Article" },
  "news.categories": { th: "จัดการหมวดหมู่", en: "Manage Categories" },
  
  // Tabs & Filters
  "news.tab.all": { th: "ทั้งหมด", en: "All" },
  "news.tab.draft": { th: "ฉบับร่าง", en: "Drafts" },
  "news.tab.pending": { th: "รอตรวจทาน", en: "Pending Review" },
  "news.tab.revision": { th: "ส่งกลับแก้ไข", en: "Revision Requested" },
  "news.tab.published": { th: "เผยแพร่แล้ว", en: "Published" },
  "news.tab.archived": { th: "จัดเก็บแล้ว", en: "Archived" },
  
  // Status Labels
  "news.status.DRAFT": { th: "ฉบับร่าง", en: "Draft" },
  "news.status.PENDING_REVIEW": { th: "รอตรวจทาน", en: "Pending Review" },
  "news.status.REVISION_REQUESTED": { th: "ส่งกลับแก้ไข", en: "Revision Requested" },
  "news.status.PUBLISHED": { th: "เผยแพร่แล้ว", en: "Published" },
  "news.status.ARCHIVED": { th: "จัดเก็บ", en: "Archived" },

  // Fields
  "news.field.titleTh": { th: "หัวข้อข่าว (ภาษาไทย)", en: "Title (Thai)" },
  "news.field.titleEn": { th: "หัวข้อข่าว (ภาษาอังกฤษ)", en: "Title (English)" },
  "news.field.category": { th: "หมวดหมู่", en: "Category" },
  "news.field.summaryTh": { th: "บทคัดย่อ/เนื้อหาย่อ (ไทย)", en: "Summary (Thai)" },
  "news.field.summaryEn": { th: "บทคัดย่อ/เนื้อหาย่อ (อังกฤษ)", en: "Summary (English)" },
  "news.field.contentTh": { th: "เนื้อหาข่าว (ภาษาไทย)", en: "Content (Thai)" },
  "news.field.contentEn": { th: "เนื้อหาข่าว (ภาษาอังกฤษ)", en: "Content (English)" },
  "news.field.coverImage": { th: "รูปภาพหน้าปก (URL)", en: "Cover Image URL" },
  "news.field.youtubeUrl": { th: "ลิงก์วิดีโอ YouTube", en: "YouTube Video URL" },
  "news.field.publishedAt": { th: "วันเวลาเผยแพร่", en: "Publish Date" },
  "news.field.expiresAt": { th: "วันหมดอายุข่าว", en: "Expiry Date" },
  "news.field.isPinned": { th: "ปักหมุดข่าวเด่น", en: "Pin this article" },
  "news.field.pinnedOrder": { th: "ลำดับการปักหมุด", en: "Pinned Order" },
  "news.field.author": { th: "ผู้เขียน", en: "Author" },
  "news.field.views": { th: "ยอดเข้าชม", en: "Views" },
  "news.field.revisionNotes": { th: "หมายเหตุสั่งแก้ไข", en: "Revision Notes" },

  // Actions & Buttons
  "news.action.saveDraft": { th: "บันทึกร่าง", en: "Save Draft" },
  "news.action.submitReview": { th: "ส่งตรวจทาน", en: "Submit for Review" },
  "news.action.approve": { th: "อนุมัติเผยแพร่", en: "Approve & Publish" },
  "news.action.requestRevision": { th: "ส่งกลับให้แก้ไข", en: "Request Revision" },
  "news.action.archive": { th: "จัดเก็บข่าว", en: "Archive" },
  "news.action.delete": { th: "ลบข่าว", en: "Delete" },
  "news.action.pin": { th: "ปักหมุด", en: "Pin" },
  "news.action.unpin": { th: "ถอดหมุด", en: "Unpin" },
  "news.action.searchPlaceholder": { th: "ค้นหาตามหัวข้อข่าว...", en: "Search by title..." },

  // Confirmation & Feedback
  "news.confirm.delete": { th: "คุณแน่ใจหรือไม่ว่าต้องการลบข่าวนี้?", en: "Are you sure you want to delete this article?" },
  "news.feedback.saved": { th: "บันทึกข้อมูลเรียบร้อยแล้ว", en: "Saved successfully" },
  "news.feedback.submitted": { th: "ส่งตรวจทานเรียบร้อยแล้ว", en: "Submitted for review" },
  "news.feedback.approved": { th: "อนุมัติและเผยแพร่ข่าวแล้ว", en: "Approved and published" },
  "news.feedback.returned": { th: "ส่งกลับให้แก้ไขเรียบร้อยแล้ว", en: "Returned for revision" },
  "news.feedback.deleted": { th: "ลบข่าวเรียบร้อยแล้ว", en: "Article deleted" },

  // Module & Permission Labels
  "roles.module.news": { th: "ระบบข่าวสารประชาสัมพันธ์", en: "News & Announcements" },
  "perm.news:read": { th: "อ่านและดูรายการข่าวสาร", en: "View news articles" },
  "perm.news:create": { th: "สร้างและแก้ไขร่างข่าว", en: "Create and edit own drafts" },
  "perm.news:review": { th: "ตรวจทานและอนุมัติเผยแพร่ข่าว", en: "Review and publish articles" },
  "perm.news:pin": { th: "ปักหมุดข่าวเด่นบนหน้าแรก", en: "Pin articles on homepage" },
  "perm.news:manage_categories": { th: "จัดการหมวดหมู่ข่าวสาร", en: "Manage news categories" },
  "perm.news:manage_all": { th: "จัดการข่าวสารทั้งหมดในระบบ", en: "Manage all news articles" },
} as const;
