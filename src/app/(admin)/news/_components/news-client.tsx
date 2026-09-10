"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Plus,
  Search,
  Pin,
  PinOff,
  CheckCircle2,
  RotateCcw,
  Trash2,
  Edit3,
  Tag,
  X,
  Upload,
  ImageIcon,
  Loader2,
  Crop,
  ZoomIn,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Cropper, { type Area } from "react-easy-crop";
import { getCroppedImg } from "@/shared/lib/crop-image";
import { useT } from "@/shared/lib/i18n/client";
import {
  getNewsArticlesAction,
  getNewsCategoriesAction,
  createNewsCategoryAction,
  updateNewsCategoryAction,
  deleteNewsCategoryAction,
  createNewsArticleAction,
  updateNewsArticleAction,
  submitForReviewAction,
  approveAndPublishAction,
  requestRevisionAction,
  togglePinAction,
  deleteNewsArticleAction,
} from "@/features/news/actions";
import type { NewsArticleDto, NewsCategoryDto } from "@/features/news";
import type { NewsStatus } from "@/generated/prisma";

interface NewsClientProps {
  canCreate: boolean;
  canReview: boolean;
  canPin: boolean;
  canManageAll: boolean;
  canManageCategories: boolean;
  currentUserId: string;
}

export function NewsClient({
  canCreate,
  canReview,
  canPin,
  canManageAll,
  canManageCategories,
  currentUserId,
}: NewsClientProps) {
  const t = useT();
  const [articles, setArticles] = useState<NewsArticleDto[]>([]);
  const [categories, setCategories] = useState<NewsCategoryDto[]>([]);
  const [activeTab, setActiveTab] = useState<"ALL" | NewsStatus>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  // Dialog states
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticleDto | null>(null);
  const [revisionNotesModal, setRevisionNotesModal] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState("");

  // Category Management Modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<NewsCategoryDto | null>(null);
  const [catNameTh, setCatNameTh] = useState("");
  const [catNameEn, setCatNameEn] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catColor, setCatColor] = useState("blue");

  // Form inputs for Article
  const [formCategory, setFormCategory] = useState("");
  const [formTitleTh, setFormTitleTh] = useState("");
  const [formTitleEn, setFormTitleEn] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formSummaryTh, setFormSummaryTh] = useState("");
  const [formSummaryEn, setFormSummaryEn] = useState("");
  const [formContentTh, setFormContentTh] = useState("");
  const [formContentEn, setFormContentEn] = useState("");
  const [formCoverImage, setFormCoverImage] = useState("");
  const [formYoutube, setFormYoutube] = useState("");
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Image Cropper states (16:9 fixed ratio)
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    const [artsRes, catsRes] = await Promise.all([
      getNewsArticlesAction({
        status: activeTab === "ALL" ? undefined : activeTab,
        categoryId: selectedCategory === "ALL" ? undefined : selectedCategory,
        search: search.trim() || undefined,
      }),
      getNewsCategoriesAction(),
    ]);

    if (artsRes.ok) setArticles(artsRes.data);
    if (catsRes.ok) setCategories(catsRes.data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [activeTab, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  /* ================= Category Actions ================= */
  const openCategoryModal = () => {
    setEditingCategory(null);
    setCatNameTh("");
    setCatNameEn("");
    setCatSlug("");
    setCatColor("blue");
    setIsCategoryModalOpen(true);
  };

  const handleCatAutoSlug = (th: string) => {
    setCatNameTh(th);
    if (!editingCategory) {
      const slug = th
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\u0E00-\u0E7F]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setCatSlug(slug || `cat-${Date.now()}`);
    }
  };

  const handleSaveCategory = () => {
    if (!catNameTh.trim() || !catSlug.trim()) {
      toast.error("กรุณาระบุชื่อหมวดหมู่และ Slug");
      return;
    }

    startTransition(async () => {
      if (editingCategory) {
        const res = await updateNewsCategoryAction({
          id: editingCategory.id,
          nameTh: catNameTh,
          nameEn: catNameEn || catNameTh,
          slug: catSlug,
          colorBadge: catColor,
          displayOrder: editingCategory.displayOrder,
          isActive: true,
        });
        if (res.ok) {
          toast.success("บันทึกการแก้ไขหมวดหมู่แล้ว");
          setEditingCategory(null);
          setCatNameTh("");
          setCatNameEn("");
          setCatSlug("");
          loadData();
        } else {
          toast.error(res.error.message);
        }
      } else {
        const res = await createNewsCategoryAction({
          nameTh: catNameTh,
          nameEn: catNameEn || catNameTh,
          slug: catSlug,
          colorBadge: catColor,
          displayOrder: categories.length + 1,
        });
        if (res.ok) {
          toast.success("สร้างหมวดหมู่ใหม่สำเร็จ");
          setCatNameTh("");
          setCatNameEn("");
          setCatSlug("");
          loadData();
        } else {
          toast.error(res.error.message);
        }
      }
    });
  };

  const handleEditCategory = (c: NewsCategoryDto) => {
    setEditingCategory(c);
    setCatNameTh(c.nameTh);
    setCatNameEn(c.nameEn);
    setCatSlug(c.slug);
    setCatColor(c.colorBadge || "blue");
  };

  const handleDeleteCategory = (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่นี้?")) return;
    startTransition(async () => {
      const res = await deleteNewsCategoryAction(id);
      if (res.ok) {
        toast.success("ลบหมวดหมู่เรียบร้อยแล้ว");
        loadData();
      } else {
        toast.error("ไม่สามารถลบได้ เนื่องจากมีข่าวในหมวดหมู่นี้อยู่");
      }
    });
  };

  /* ================= Article Actions ================= */
  const openCreateModal = () => {
    setEditingArticle(null);
    setFormCategory(categories[0]?.id || "");
    setFormTitleTh("");
    setFormTitleEn("");
    setFormSlug("");
    setFormSummaryTh("");
    setFormSummaryEn("");
    setFormContentTh("");
    setFormContentEn("");
    setFormCoverImage("");
    setFormYoutube("");
    setFormIsPinned(false);
    setIsOpenModal(true);
  };

  const openEditModal = (a: NewsArticleDto) => {
    setEditingArticle(a);
    setFormCategory(a.categoryId);
    setFormTitleTh(a.titleTh);
    setFormTitleEn(a.titleEn);
    setFormSlug(a.slug);
    setFormSummaryTh(a.summaryTh || "");
    setFormSummaryEn(a.summaryEn || "");
    setFormContentTh(a.contentTh);
    setFormContentEn(a.contentEn);
    setFormCoverImage(a.coverImageUrl || "");
    setFormYoutube(a.youtubeUrl || "");
    setFormIsPinned(a.isPinned);
    setIsOpenModal(true);
  };

  const handleAutoSlug = (title: string) => {
    setFormTitleTh(title);
    if (!editingArticle) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\u0E00-\u0E7F]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormSlug(generated || `news-${Date.now()}`);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so the same file can be selected again if needed
    e.target.value = "";

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setCropImageSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setIsCropModalOpen(true);
    });
    reader.readAsDataURL(file);
  };

  const handleConfirmCrop = async () => {
    if (!cropImageSrc || !croppedAreaPixels) return;

    setIsUploading(true);
    try {
      const croppedBlob = await getCroppedImg(cropImageSrc, croppedAreaPixels);
      const file = new File([croppedBlob], `cover-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormCoverImage(data.url);
        setIsCropModalOpen(false);
        setCropImageSrc(null);
        toast.success("ตัดและอัปโหลดรูปภาพหน้าปกสำเร็จ (16:9)");
      } else {
        toast.error(data.error || "เกิดข้อผิดพลาดในการอัปโหลด");
      }
    } catch (err) {
      console.error(err);
      toast.error("ตัดรูปภาพไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelCrop = () => {
    setIsCropModalOpen(false);
    setCropImageSrc(null);
  };

  const handleSave = () => {
    if (!formCategory || !formTitleTh || !formContentTh || !formSlug) {
      toast.error(t("error.validation"));
      return;
    }

    startTransition(async () => {
      const payload = {
        categoryId: formCategory,
        titleTh: formTitleTh,
        titleEn: formTitleEn || formTitleTh,
        slug: formSlug,
        summaryTh: formSummaryTh,
        summaryEn: formSummaryEn,
        contentTh: formContentTh,
        contentEn: formContentEn || formContentTh,
        coverImageUrl: formCoverImage,
        youtubeUrl: formYoutube,
        isPinned: formIsPinned,
      };

      if (editingArticle) {
        const res = await updateNewsArticleAction({ ...payload, id: editingArticle.id });
        if (res.ok) {
          toast.success(t("news.feedback.saved"));
          setIsOpenModal(false);
          loadData();
        } else {
          toast.error(res.error.message);
        }
      } else {
        const res = await createNewsArticleAction(payload);
        if (res.ok) {
          toast.success(t("news.feedback.saved"));
          setIsOpenModal(false);
          loadData();
        } else {
          toast.error(res.error.message);
        }
      }
    });
  };

  const handleSubmitReview = (id: string) => {
    startTransition(async () => {
      const res = await submitForReviewAction(id);
      if (res.ok) {
        toast.success(t("news.feedback.submitted"));
        loadData();
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const handleApprove = (id: string) => {
    startTransition(async () => {
      const res = await approveAndPublishAction(id);
      if (res.ok) {
        toast.success(t("news.feedback.approved"));
        loadData();
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const handleRequestRevision = (id: string) => {
    if (!notesInput.trim()) {
      toast.error("กรุณาระบุเหตุผลหรือข้อความสั่งแก้ไข");
      return;
    }
    startTransition(async () => {
      const res = await requestRevisionAction({ id, revisionNotes: notesInput });
      if (res.ok) {
        toast.success(t("news.feedback.returned"));
        setRevisionNotesModal(null);
        setNotesInput("");
        loadData();
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const handleTogglePin = (id: string, currentPinned: boolean) => {
    startTransition(async () => {
      const res = await togglePinAction(id, !currentPinned);
      if (res.ok) {
        toast.success(currentPinned ? "ถอดหมุดข่าวแล้ว" : "ปักหมุดข่าวเด่นแล้ว");
        loadData();
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm(t("news.confirm.delete"))) return;
    startTransition(async () => {
      const res = await deleteNewsArticleAction(id);
      if (res.ok) {
        toast.success(t("news.feedback.deleted"));
        loadData();
      } else {
        toast.error(res.error.message);
      }
    });
  };

  const getStatusBadge = (status: NewsStatus) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            เผยแพร่แล้ว
          </span>
        );
      case "PENDING_REVIEW":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            รอตรวจทาน
          </span>
        );
      case "REVISION_REQUESTED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            สั่งแก้ไข
          </span>
        );
      case "ARCHIVED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
            จัดเก็บแล้ว
          </span>
        );
      case "DRAFT":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
            ฉบับร่าง
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {t("news.title")}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t("news.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canManageCategories && (
            <Button
              variant="outline"
              onClick={openCategoryModal}
              className="flex items-center gap-2"
            >
              <Tag className="w-4 h-4" />
              {t("news.categories")}
            </Button>
          )}
          {canCreate && (
            <Button onClick={openCreateModal} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {t("news.create")}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-4 shadow-sm">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          {[
            { key: "ALL", label: t("news.tab.all") },
            { key: "PUBLISHED", label: t("news.tab.published") },
            { key: "PENDING_REVIEW", label: t("news.tab.pending") },
            { key: "REVISION_REQUESTED", label: t("news.tab.revision") },
            { key: "DRAFT", label: t("news.tab.draft") },
            { key: "ARCHIVED", label: t("news.tab.archived") },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === tab.key
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-96">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("news.action.searchPlaceholder")}
                className="pl-9 h-9 text-xs"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm">
              {t("common.search")}
            </Button>
          </form>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-zinc-500 whitespace-nowrap">
              {t("news.field.category")}:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none"
            >
              <option value="ALL">{t("common.all")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameTh}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Articles Table Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-zinc-400">{t("common.loading")}</div>
        ) : articles.length === 0 ? (
          <div className="p-12 text-center text-sm text-zinc-400">ยังไม่มีรายการข่าวสาร</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                <tr>
                  <th className="py-3 px-4">หัวข้อข่าว</th>
                  <th className="py-3 px-4">หมวดหมู่</th>
                  <th className="py-3 px-4">สถานะ</th>
                  <th className="py-3 px-4">ผู้เขียน</th>
                  <th className="py-3 px-4">ยอดเข้าชม</th>
                  <th className="py-3 px-4 text-right">การทำงาน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {articles.map((a) => {
                  const isAuthor = a.authorId === currentUserId;
                  const canEditThis = canManageAll || isAuthor;

                  return (
                    <tr key={a.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30">
                      <td className="py-3 px-4 max-w-sm">
                        <div className="flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-100">
                          {a.isPinned && (
                            <span className="text-amber-500" title="ปักหมุดข่าวเด่น">
                              <Pin className="w-4 h-4 fill-current" />
                            </span>
                          )}
                          <span className="truncate">{a.titleTh}</span>
                        </div>
                        {a.revisionNotes && a.status === "REVISION_REQUESTED" && (
                          <p className="text-xs text-rose-500 mt-1">
                            หมายเหตุสั่งแก้: {a.revisionNotes}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-zinc-600 dark:text-zinc-400">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium">
                          {a.categoryNameTh || "-"}
                        </span>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(a.status)}</td>
                      <td className="py-3 px-4 text-xs text-zinc-600 dark:text-zinc-400">
                        {a.authorName}
                      </td>
                      <td className="py-3 px-4 text-xs text-zinc-600 dark:text-zinc-400">
                        {a.viewCount} ครั้ง
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        {/* Pin Button */}
                        {canPin && (
                          <button
                            onClick={() => handleTogglePin(a.id, a.isPinned)}
                            className="p-1.5 text-zinc-400 hover:text-amber-500 rounded"
                            title={a.isPinned ? "ถอดหมุด" : "ปักหมุดหน้าแรก"}
                          >
                            {a.isPinned ? (
                              <PinOff className="w-4 h-4" />
                            ) : (
                              <Pin className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        {/* Submit Review */}
                        {(a.status === "DRAFT" || a.status === "REVISION_REQUESTED") &&
                          canEditThis && (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-7 text-xs px-2"
                              onClick={() => handleSubmitReview(a.id)}
                            >
                              ส่งตรวจทาน
                            </Button>
                          )}

                        {/* Approve/Reject Buttons */}
                        {a.status === "PENDING_REVIEW" && canReview && (
                          <>
                            <button
                              onClick={() => handleApprove(a.id)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                              title="อนุมัติและเผยแพร่"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setRevisionNotesModal(a.id);
                                setNotesInput("");
                              }}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                              title="ส่งกลับให้แก้ไข"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* Edit Button */}
                        {canEditThis && (
                          <button
                            onClick={() => openEditModal(a)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded"
                            title="แก้ไขข่าว"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete Button */}
                        {canManageAll && (
                          <button
                            onClick={() => handleDelete(a.id)}
                            className="p-1.5 text-zinc-400 hover:text-rose-600 rounded"
                            title="ลบข่าว"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Category Management */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-xl p-6 shadow-xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                {t("news.categories")}
              </h2>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Form */}
            <div className="bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-lg space-y-3 border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                {editingCategory ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                    ชื่อหมวดหมู่ (ไทย) *
                  </label>
                  <Input
                    value={catNameTh}
                    onChange={(e) => handleCatAutoSlug(e.target.value)}
                    placeholder="เช่น ข่าวกิจกรรมนักศึกษา"
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                    ชื่อหมวดหมู่ (อังกฤษ)
                  </label>
                  <Input
                    value={catNameEn}
                    onChange={(e) => setCatNameEn(e.target.value)}
                    placeholder="e.g. Student Activities"
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                    URL Slug *
                  </label>
                  <Input
                    value={catSlug}
                    onChange={(e) => setCatSlug(e.target.value)}
                    placeholder="student-activities"
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                    สีป้าย (Badge Tone)
                  </label>
                  <select
                    value={catColor}
                    onChange={(e) => setCatColor(e.target.value)}
                    className="w-full text-xs h-8 px-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                  >
                    <option value="blue">Blue (น้ำเงิน)</option>
                    <option value="emerald">Emerald (เขียว)</option>
                    <option value="amber">Amber (ส้ม/เหลือง)</option>
                    <option value="rose">Rose (แดง/ชมพู)</option>
                    <option value="purple">Purple (ม่วง)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                {editingCategory && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingCategory(null);
                      setCatNameTh("");
                      setCatNameEn("");
                      setCatSlug("");
                    }}
                  >
                    ยกเลิก
                  </Button>
                )}
                <Button size="sm" onClick={handleSaveCategory} disabled={pending}>
                  {editingCategory ? "บันทึกการแก้ไข" : "เพิ่มหมวดหมู่"}
                </Button>
              </div>
            </div>

            {/* Category List Table */}
            <div className="flex-1 overflow-y-auto border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 sticky top-0">
                  <tr>
                    <th className="p-2.5">ชื่อหมวดหมู่</th>
                    <th className="p-2.5">Slug</th>
                    <th className="p-2.5 text-right">การทำงาน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {categories.map((c) => (
                    <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                      <td className="p-2.5 font-medium text-zinc-900 dark:text-zinc-100">
                        {c.nameTh}
                        {c.nameEn && (
                          <span className="text-zinc-400 text-[11px] block">{c.nameEn}</span>
                        )}
                      </td>
                      <td className="p-2.5 text-zinc-500">{c.slug}</td>
                      <td className="p-2.5 text-right space-x-1">
                        <button
                          onClick={() => handleEditCategory(c)}
                          className="p-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                          title="แก้ไข"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(c.id)}
                          className="p-1 text-zinc-500 hover:text-rose-600"
                          title="ลบ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create/Edit Article */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-xl p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {editingArticle ? t("news.edit") : t("news.create")}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t("news.field.category")} *
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full text-xs h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameTh}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  URL Slug *
                </label>
                <Input
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="news-slug-url"
                  className="h-9 text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t("news.field.titleTh")} *
                </label>
                <Input
                  value={formTitleTh}
                  onChange={(e) => handleAutoSlug(e.target.value)}
                  placeholder="ใส่หัวข้อข่าวภาษาไทย"
                  className="h-9 text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t("news.field.titleEn")}
                </label>
                <Input
                  value={formTitleEn}
                  onChange={(e) => setFormTitleEn(e.target.value)}
                  placeholder="Article title in English"
                  className="h-9 text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t("news.field.summaryTh")}
                </label>
                <Input
                  value={formSummaryTh}
                  onChange={(e) => setFormSummaryTh(e.target.value)}
                  placeholder="คำโปรยหรือเนื้อหาย่อภาษาไทย"
                  className="h-9 text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t("news.field.contentTh")} *
                </label>
                <textarea
                  rows={4}
                  value={formContentTh}
                  onChange={(e) => setFormContentTh(e.target.value)}
                  placeholder="เนื้อหาข่าวแบบละเอียด..."
                  className="w-full text-xs p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t("news.field.coverImage")}
                </label>
                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                  <Input
                    value={formCoverImage}
                    onChange={(e) => setFormCoverImage(e.target.value)}
                    placeholder="ใส่ URL รูปภาพ หรือกดปุ่มอัปโหลดด้านขวา..."
                    className="h-9 text-xs flex-1"
                  />
                  <label className="relative inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-medium rounded-lg cursor-pointer transition-colors border border-zinc-200 dark:border-zinc-700 shrink-0">
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-600" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span>{isUploading ? "กำลังอัปโหลด..." : "อัปโหลดรูปจากเครื่อง"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      disabled={isUploading}
                      className="sr-only"
                    />
                  </label>
                </div>
                {formCoverImage && (
                  <div className="mt-2 relative w-full h-36 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
                    <img
                      src={formCoverImage}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setFormCoverImage("")}
                      className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full"
                      title="ลบรูปภาพ"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  {t("news.field.youtubeUrl")}
                </label>
                <Input
                  value={formYoutube}
                  onChange={(e) => setFormYoutube(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="h-9 text-xs"
                />
              </div>

              {canPin && (
                <div className="flex items-center gap-2 pt-2 md:col-span-2">
                  <input
                    type="checkbox"
                    id="isPinnedCheck"
                    checked={formIsPinned}
                    onChange={(e) => setFormIsPinned(e.target.checked)}
                    className="rounded text-zinc-900"
                  />
                  <label
                    htmlFor="isPinnedCheck"
                    className="text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                  >
                    {t("news.field.isPinned")}
                  </label>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <Button
                variant="secondary"
                onClick={() => setIsOpenModal(false)}
                disabled={pending}
              >
                {t("common.cancel")}
              </Button>
              <Button onClick={handleSave} disabled={pending}>
                {t("common.save")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Request Revision Notes */}
      {revisionNotesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              ระบุข้อความ/เหตุผลที่สั่งแก้ไข
            </h3>
            <textarea
              rows={3}
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="เช่น ขอให้เพิ่มภาพถ่ายกิจกรรม และตรวจทานวันที่จัดสัมมนาอีกครั้ง..."
              className="w-full text-xs p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setRevisionNotesModal(null)}>
                ยกเลิก
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleRequestRevision(revisionNotesModal)}
              >
                ส่งกลับให้แก้ไข
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Image Cropper (16:9 Aspect Ratio) */}
      {isCropModalOpen && cropImageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-4 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <Crop className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    ปรับแต่งและครอบตัดภาพหน้าปก (อัตราส่วน 16:9)
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    ลากตำแหน่งและซูมภาพเพื่อจัดให้พอดีกับกรอบแสดงผลหน้าเว็บ
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancelCrop}
                disabled={isUploading}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cropper Container */}
            <div className="relative w-full h-72 sm:h-80 bg-zinc-950 rounded-xl overflow-hidden shadow-inner">
              <Cropper
                image={cropImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9}
                onCropChange={setCrop}
                onCropComplete={(_croppedArea, croppedAreaPixels) => {
                  setCroppedAreaPixels(croppedAreaPixels);
                }}
                onZoomChange={setZoom}
              />
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-3 px-2 py-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
              <ZoomIn className="w-4 h-4 text-zinc-500 shrink-0" />
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 shrink-0">
                ซูมภาพ:
              </span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.05}
                aria-label="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <span className="text-xs font-mono text-zinc-500 shrink-0 min-w-[36px] text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                variant="secondary"
                onClick={handleCancelCrop}
                disabled={isUploading}
                className="text-xs"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleConfirmCrop}
                disabled={isUploading}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    กำลังครอบตัดและอัปโหลด...
                  </>
                ) : (
                  <>
                    <Crop className="w-3.5 h-3.5" />
                    ใช้รูปภาพนี้
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
