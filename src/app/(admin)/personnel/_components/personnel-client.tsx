"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit3,
  Building2,
  X,
  Upload,
  User,
  Loader2,
  Crop,
  ZoomIn,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Cropper, { type Area } from "react-easy-crop";
import { getCroppedImg } from "@/shared/lib/crop-image";
import { useT } from "@/shared/lib/i18n/client";
import {
  getDepartmentsAction,
  createDepartmentAction,
  updateDepartmentAction,
  deleteDepartmentAction,
  getPersonnelsAction,
  createPersonnelAction,
  updatePersonnelAction,
  deletePersonnelAction,
} from "@/features/personnel/actions";
import type { DepartmentDto, PersonnelDto } from "@/features/personnel";
import type { PersonnelType } from "@/generated/prisma";

interface PersonnelClientProps {
  canManage: boolean;
  canManageDepartments: boolean;
}

export function PersonnelClient({
  canManage,
  canManageDepartments,
}: PersonnelClientProps) {
  const t = useT();
  const [personnels, setPersonnels] = useState<PersonnelDto[]>([]);
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<"ALL" | PersonnelType>("ALL");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  // Dialog states for Personnel
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<PersonnelDto | null>(null);

  // Dialog states for Department Management
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentDto | null>(null);
  const [deptNameTh, setDeptNameTh] = useState("");
  const [deptNameEn, setDeptNameEn] = useState("");
  const [deptSlug, setDeptSlug] = useState("");
  const [deptDesc, setDeptDesc] = useState("");
  const [deptOrder, setDeptOrder] = useState(0);

  // Form states for Personnel
  const [formDeptId, setFormDeptId] = useState("");
  const [formType, setFormType] = useState<PersonnelType>("ACADEMIC");
  const [formTitleTh, setFormTitleTh] = useState("");
  const [formTitleEn, setFormTitleEn] = useState("");
  const [formFirstNameTh, setFormFirstNameTh] = useState("");
  const [formLastNameTh, setFormLastNameTh] = useState("");
  const [formFirstNameEn, setFormFirstNameEn] = useState("");
  const [formLastNameEn, setFormLastNameEn] = useState("");
  const [formAcademicRankTh, setFormAcademicRankTh] = useState("");
  const [formAcademicRankEn, setFormAcademicRankEn] = useState("");
  const [formPositionTh, setFormPositionTh] = useState("");
  const [formPositionEn, setFormPositionEn] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formOfficeRoom, setFormOfficeRoom] = useState("");
  const [formEducation, setFormEducation] = useState("");
  const [formExpertise, setFormExpertise] = useState("");
  const [formWebsiteUrl, setFormWebsiteUrl] = useState("");
  const [formAvatarUrl, setFormAvatarUrl] = useState("");
  const [formDisplayOrder, setFormDisplayOrder] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);

  // Image Cropper states (3:4 ratio for portraits)
  const [isUploading, setIsUploading] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [deptsRes, persRes] = await Promise.all([
      getDepartmentsAction(),
      getPersonnelsAction({
        departmentId: selectedDepartment === "ALL" ? undefined : selectedDepartment,
        type: selectedType === "ALL" ? undefined : selectedType,
        search: search.trim() || undefined,
      }),
    ]);

    if (deptsRes.ok) setDepartments(deptsRes.data);
    if (persRes.ok) setPersonnels(persRes.data);
    setIsLoading(false);
  }, [selectedDepartment, selectedType, search]);

  useEffect(() => {
    let active = true;
    const fetchFresh = async () => {
      setIsLoading(true);
      const [deptsRes, persRes] = await Promise.all([
        getDepartmentsAction(),
        getPersonnelsAction({
          departmentId: selectedDepartment === "ALL" ? undefined : selectedDepartment,
          type: selectedType === "ALL" ? undefined : selectedType,
          search: search.trim() || undefined,
        }),
      ]);

      if (!active) return;
      if (deptsRes.ok) setDepartments(deptsRes.data);
      if (persRes.ok) setPersonnels(persRes.data);
      setIsLoading(false);
    };

    fetchFresh();
    return () => {
      active = false;
    };
  }, [selectedDepartment, selectedType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  /* ================= Department Actions ================= */
  const openDeptModal = () => {
    setEditingDept(null);
    setDeptNameTh("");
    setDeptNameEn("");
    setDeptSlug("");
    setDeptDesc("");
    setDeptOrder(departments.length);
    setIsDeptModalOpen(true);
  };

  const handleAutoSlug = (th: string) => {
    setDeptNameTh(th);
    if (!editingDept) {
      const slug = th
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\u0E00-\u0E7F]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setDeptSlug(slug || `dept-${Date.now()}`);
    }
  };

  const handleSaveDept = () => {
    if (!deptNameTh.trim() || !deptSlug.trim()) {
      toast.error("กรุณาระบุชื่อฝ่ายและ Slug");
      return;
    }

    startTransition(async () => {
      if (editingDept) {
        const res = await updateDepartmentAction(editingDept.id, {
          nameTh: deptNameTh,
          nameEn: deptNameEn || deptNameTh,
          slug: deptSlug,
          description: deptDesc,
          displayOrder: deptOrder,
        });
        if (res.ok) {
          toast.success("อัปเดตฝ่ายเรียบร้อยแล้ว");
          setIsDeptModalOpen(false);
          loadData();
        } else {
          toast.error(res.error.message || "เกิดข้อผิดพลาด");
        }
      } else {
        const res = await createDepartmentAction({
          nameTh: deptNameTh,
          nameEn: deptNameEn || deptNameTh,
          slug: deptSlug,
          description: deptDesc,
          displayOrder: deptOrder,
        });
        if (res.ok) {
          toast.success("สร้างฝ่ายใหม่เรียบร้อยแล้ว");
          setIsDeptModalOpen(false);
          loadData();
        } else {
          toast.error(res.error.message || "เกิดข้อผิดพลาด");
        }
      }
    });
  };

  const handleEditDept = (d: DepartmentDto) => {
    setEditingDept(d);
    setDeptNameTh(d.nameTh);
    setDeptNameEn(d.nameEn);
    setDeptSlug(d.slug);
    setDeptDesc(d.description || "");
    setDeptOrder(d.displayOrder);
  };

  const handleDeleteDept = (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบฝ่ายนี้? หากมีบุคลากรในสังกัดจะไม่สามารถลบได้")) return;
    startTransition(async () => {
      const res = await deleteDepartmentAction(id);
      if (res.ok) {
        toast.success("ลบฝ่ายเรียบร้อยแล้ว");
        loadData();
      } else {
        toast.error("ไม่สามารถลบได้ เนื่องจากมีบุคลากรในฝ่ายนี้อยู่");
      }
    });
  };

  /* ================= Personnel Form Actions ================= */
  const openCreatePersonnel = () => {
    setEditingPersonnel(null);
    setFormDeptId(departments[0]?.id || "");
    setFormType("ACADEMIC");
    setFormTitleTh("");
    setFormTitleEn("");
    setFormFirstNameTh("");
    setFormLastNameTh("");
    setFormFirstNameEn("");
    setFormLastNameEn("");
    setFormAcademicRankTh("");
    setFormAcademicRankEn("");
    setFormPositionTh("");
    setFormPositionEn("");
    setFormEmail("");
    setFormPhone("");
    setFormOfficeRoom("");
    setFormEducation("");
    setFormExpertise("");
    setFormWebsiteUrl("");
    setFormAvatarUrl("");
    setFormDisplayOrder(personnels.length);
    setFormIsActive(true);
    setIsOpenModal(true);
  };

  const openEditPersonnel = (p: PersonnelDto) => {
    setEditingPersonnel(p);
    setFormDeptId(p.departmentId);
    setFormType(p.type);
    setFormTitleTh(p.titleTh || "");
    setFormTitleEn(p.titleEn || "");
    setFormFirstNameTh(p.firstNameTh);
    setFormLastNameTh(p.lastNameTh);
    setFormFirstNameEn(p.firstNameEn);
    setFormLastNameEn(p.lastNameEn);
    setFormAcademicRankTh(p.academicRankTh || "");
    setFormAcademicRankEn(p.academicRankEn || "");
    setFormPositionTh(p.positionTh);
    setFormPositionEn(p.positionEn);
    setFormEmail(p.email || "");
    setFormPhone(p.phone || "");
    setFormOfficeRoom(p.officeRoom || "");
    setFormEducation(p.education || "");
    setFormExpertise(p.expertise || "");
    setFormWebsiteUrl(p.websiteUrl || "");
    setFormAvatarUrl(p.avatarUrl || "");
    setFormDisplayOrder(p.displayOrder);
    setFormIsActive(p.isActive);
    setIsOpenModal(true);
  };

  /* ================= Image Cropping (3:4 Ratio) ================= */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      const file = new File([croppedBlob], `avatar-${Date.now()}.jpg`, {
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
        setFormAvatarUrl(data.url);
        setIsCropModalOpen(false);
        setCropImageSrc(null);
        toast.success("ตัดและอัปโหลดรูปโปรไฟล์สำเร็จ (3:4)");
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

  const handleSavePersonnel = () => {
    if (
      !formDeptId ||
      !formFirstNameTh.trim() ||
      !formLastNameTh.trim() ||
      !formPositionTh.trim()
    ) {
      toast.error("กรุณากรอกฝ่าย ชื่อ นามสกุล และตำแหน่งภาษาไทย");
      return;
    }

    startTransition(async () => {
      const payload = {
        departmentId: formDeptId,
        type: formType,
        titleTh: formTitleTh || undefined,
        titleEn: formTitleEn || undefined,
        firstNameTh: formFirstNameTh,
        lastNameTh: formLastNameTh,
        firstNameEn: formFirstNameEn || formFirstNameTh,
        lastNameEn: formLastNameEn || formLastNameTh,
        academicRankTh: formAcademicRankTh || undefined,
        academicRankEn: formAcademicRankEn || undefined,
        positionTh: formPositionTh,
        positionEn: formPositionEn || formPositionTh,
        email: formEmail || undefined,
        phone: formPhone || undefined,
        officeRoom: formOfficeRoom || undefined,
        education: formEducation || undefined,
        expertise: formExpertise || undefined,
        websiteUrl: formWebsiteUrl || undefined,
        avatarUrl: formAvatarUrl || undefined,
        displayOrder: Number(formDisplayOrder),
        isActive: formIsActive,
      };

      if (editingPersonnel) {
        const res = await updatePersonnelAction(editingPersonnel.id, payload);
        if (res.ok) {
          toast.success("อัปเดตข้อมูลบุคลากรสำเร็จ");
          setIsOpenModal(false);
          loadData();
        } else {
          toast.error(res.error.message || "เกิดข้อผิดพลาด");
        }
      } else {
        const res = await createPersonnelAction(payload);
        if (res.ok) {
          toast.success("เพิ่มข้อมูลบุคลากรสำเร็จ");
          setIsOpenModal(false);
          loadData();
        } else {
          toast.error(res.error.message || "เกิดข้อผิดพลาด");
        }
      }
    });
  };

  const handleDeletePersonnel = (id: string, name: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ ${name}?`)) return;
    startTransition(async () => {
      const res = await deletePersonnelAction(id);
      if (res.ok) {
        toast.success("ลบข้อมูลบุคลากรเรียบร้อยแล้ว");
        loadData();
      } else {
        toast.error("ลบข้อมูลไม่สำเร็จ");
      }
    });
  };

  const handleToggleActive = (p: PersonnelDto) => {
    startTransition(async () => {
      const res = await updatePersonnelAction(p.id, { isActive: !p.isActive });
      if (res.ok) {
        toast.success(p.isActive ? "ซ่อนบุคลากรแล้ว" : "เปิดแสดงผลบุคลากรแล้ว");
        loadData();
      }
    });
  };

  const renderTypeBadge = (type: PersonnelType) => {
    switch (type) {
      case "EXECUTIVE":
        return (
          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
            ผู้บริหาร
          </span>
        );
      case "ACADEMIC":
        return (
          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
            สายวิชาการ
          </span>
        );
      case "SUPPORT":
        return (
          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            สายสนับสนุน
          </span>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {t("personnel.title")}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            จัดการข้อมูลอาจารย์ ผู้บริหาร และเจ้าหน้าที่สายสนับสนุนของคณะ
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManageDepartments && (
            <Button
              variant="outline"
              onClick={openDeptModal}
              className="flex items-center gap-1.5 text-xs h-9"
            >
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{t("personnel.manageDepartments")}</span>
            </Button>
          )}

          {canManage && (
            <Button
              onClick={openCreatePersonnel}
              disabled={departments.length === 0}
              className="flex items-center gap-1.5 text-xs h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t("personnel.create")}</span>
            </Button>
          )}
        </div>
      </div>

      {departments.length === 0 && !isLoading && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
          <span>กรุณาสร้างฝ่าย/ภาควิชาก่อน เพื่อใช้สำหรับจัดกลุ่มบุคลากร</span>
          {canManageDepartments && (
            <Button size="sm" variant="outline" onClick={openDeptModal} className="h-7 text-xs">
              สร้างฝ่ายตอนนี้
            </Button>
          )}
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="text-xs h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none"
          >
            <option value="ALL">{t("personnel.allDepartments")}</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nameTh} ({d.personnelCount ?? 0})
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as "ALL" | PersonnelType)}
            className="text-xs h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none"
          >
            <option value="ALL">{t("personnel.allTypes")}</option>
            <option value="EXECUTIVE">{t("personnel.type.executive")}</option>
            <option value="ACADEMIC">{t("personnel.type.academic")}</option>
            <option value="SUPPORT">{t("personnel.type.support")}</option>
          </select>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-72">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อ, ตำแหน่ง, อีเมล..."
              className="pl-8 text-xs h-9"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" className="h-9 px-3 text-xs">
            ค้นหา
          </Button>
        </form>
      </div>

      {/* Personnel Table / Cards */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <span className="text-xs">กำลังโหลดข้อมูลบุคลากร...</span>
          </div>
        ) : personnels.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 dark:text-zinc-400">
            <User className="w-10 h-10 mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
            <p className="text-sm font-medium">ไม่พบข้อมูลบุคลากร</p>
            <p className="text-xs mt-1">ลองเปลี่ยนตัวกรอง หรือกดปุ่ม &quot;เพิ่มบุคลากร&quot; ด้านบน</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 w-16">ลำดับ</th>
                  <th className="px-4 py-3">บุคลากร</th>
                  <th className="px-4 py-3">ตำแหน่งและสังกัด</th>
                  <th className="px-4 py-3">ประเภท</th>
                  <th className="px-4 py-3">ช่องทางติดต่อ</th>
                  <th className="px-4 py-3 text-center">สถานะ</th>
                  <th className="px-4 py-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {personnels.map((p) => {
                  const fullNameTh = `${p.academicRankTh || p.titleTh || ""} ${p.firstNameTh} ${p.lastNameTh}`.trim();
                  const fullNameEn = `${p.academicRankEn || p.titleEn || ""} ${p.firstNameEn} ${p.lastNameEn}`.trim();

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-zinc-50/75 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-zinc-400 text-center">
                        {p.displayOrder}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-16 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                            {p.avatarUrl ? (
                              <img
                                src={p.avatarUrl}
                                alt={fullNameTh}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-6 h-6 text-zinc-400" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm block">
                              {fullNameTh}
                            </span>
                            <span className="text-zinc-400 text-[11px] block">
                              {fullNameEn}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-medium text-zinc-800 dark:text-zinc-200 block">
                          {p.positionTh}
                        </span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
                          {p.departmentNameTh}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {renderTypeBadge(p.type)}
                      </td>

                      <td className="px-4 py-3 space-y-0.5 text-zinc-600 dark:text-zinc-300">
                        {p.email && (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Mail className="w-3 h-3 text-zinc-400" />
                            <span>{p.email}</span>
                          </div>
                        )}
                        {p.phone && (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Phone className="w-3 h-3 text-zinc-400" />
                            <span>{p.phone}</span>
                          </div>
                        )}
                        {p.officeRoom && (
                          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                            <MapPin className="w-3 h-3" />
                            <span>ห้อง {p.officeRoom}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleActive(p)}
                          disabled={!canManage || pending}
                          className="inline-flex items-center gap-1 text-[11px] font-medium"
                          title="คลิกเพื่อสลับเปิด/ปิดสถานะ"
                        >
                          {p.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                              <CheckCircle2 className="w-3 h-3" />
                              เปิดแสดงผล
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                              <XCircle className="w-3 h-3" />
                              ซ่อนอยู่
                            </span>
                          )}
                        </button>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canManage && (
                            <>
                              <button
                                onClick={() => openEditPersonnel(p)}
                                className="p-1.5 text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                title="แก้ไข"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePersonnel(p.id, fullNameTh)}
                                className="p-1.5 text-zinc-600 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                title="ลบ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create/Edit Personnel */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-3xl rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {editingPersonnel ? t("personnel.edit") : t("personnel.create")}
              </h2>
              <button
                onClick={() => setIsOpenModal(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Photo Avatar & Upload */}
              <div className="md:col-span-1 flex flex-col items-center justify-start space-y-3 p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  รูปถ่ายประจำตัว (3:4)
                </span>
                <div className="relative w-32 h-44 rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-700 border-2 border-dashed border-zinc-300 dark:border-zinc-600 flex items-center justify-center shadow-inner">
                  {formAvatarUrl ? (
                    <img
                      src={formAvatarUrl}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-zinc-400" />
                  )}
                  {formAvatarUrl && (
                    <button
                      type="button"
                      onClick={() => setFormAvatarUrl("")}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full"
                      title="ลบรูปภาพ"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <label className="w-full relative inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg cursor-pointer transition-colors shadow-sm">
                  {isUploading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{isUploading ? "กำลังตัดภาพ..." : "อัปโหลดและครอปรูป"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={isUploading}
                    className="sr-only"
                  />
                </label>
                <p className="text-[11px] text-zinc-400 text-center">
                  รองรับ JPG, PNG, WebP ขนาดแนะนำสัดส่วน 3:4
                </p>
              </div>

              {/* Main Fields */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      ฝ่าย / ภาควิชา *
                    </label>
                    <select
                      value={formDeptId}
                      onChange={(e) => setFormDeptId(e.target.value)}
                      className="w-full text-xs h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nameTh}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      ประเภทบุคลากร *
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as PersonnelType)}
                      className="w-full text-xs h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none"
                    >
                      <option value="EXECUTIVE">ผู้บริหาร (Executive)</option>
                      <option value="ACADEMIC">สายวิชาการ (Academic Faculty)</option>
                      <option value="SUPPORT">สายสนับสนุน (Support Staff)</option>
                    </select>
                  </div>
                </div>

                {/* Thai Name */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      ตำแหน่งทางวิชาการ
                    </label>
                    <Input
                      value={formAcademicRankTh}
                      onChange={(e) => setFormAcademicRankTh(e.target.value)}
                      placeholder="ศ.ดร. / รศ. / ผศ. / ดร."
                      className="h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      ชื่อ (ไทย) *
                    </label>
                    <Input
                      value={formFirstNameTh}
                      onChange={(e) => setFormFirstNameTh(e.target.value)}
                      placeholder="สมชาย"
                      className="h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      นามสกุล (ไทย) *
                    </label>
                    <Input
                      value={formLastNameTh}
                      onChange={(e) => setFormLastNameTh(e.target.value)}
                      placeholder="ใจดี"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                {/* English Name */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Academic Rank (EN)
                    </label>
                    <Input
                      value={formAcademicRankEn}
                      onChange={(e) => setFormAcademicRankEn(e.target.value)}
                      placeholder="Prof. Dr. / Assoc. Prof."
                      className="h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      First Name (EN)
                    </label>
                    <Input
                      value={formFirstNameEn}
                      onChange={(e) => setFormFirstNameEn(e.target.value)}
                      placeholder="Somchai"
                      className="h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Last Name (EN)
                    </label>
                    <Input
                      value={formLastNameEn}
                      onChange={(e) => setFormLastNameEn(e.target.value)}
                      placeholder="Jaidee"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                {/* Position */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      ตำแหน่งบริหาร / ตำแหน่งงาน (ไทย) *
                    </label>
                    <Input
                      value={formPositionTh}
                      onChange={(e) => setFormPositionTh(e.target.value)}
                      placeholder="คณบดี / หัวหน้าภาควิชา / อาจารย์"
                      className="h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Position (EN)
                    </label>
                    <Input
                      value={formPositionEn}
                      onChange={(e) => setFormPositionEn(e.target.value)}
                      placeholder="Dean / Head of Department / Lecturer"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                {/* Contact info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      อีเมล
                    </label>
                    <Input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="somchai@faculty.ac.th"
                      className="h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      เบอร์โทรศัพท์
                    </label>
                    <Input
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="02-xxx-xxxx ต่อ 123"
                      className="h-9 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      ห้องทำงาน
                    </label>
                    <Input
                      value={formOfficeRoom}
                      onChange={(e) => setFormOfficeRoom(e.target.value)}
                      placeholder="อาคาร 1 ชั้น 3 ห้อง 305"
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Education & Expertise */}
              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    ประวัติการศึกษา (แต่ละบรรทัด)
                  </label>
                  <textarea
                    rows={3}
                    value={formEducation}
                    onChange={(e) => setFormEducation(e.target.value)}
                    placeholder="วท.บ. (วิทยาการคอมพิวเตอร์) มหาวิทยาลัย...&#10;Ph.D. (Computer Science) University of..."
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    ความเชี่ยวชาญ / งานวิจัย
                  </label>
                  <textarea
                    rows={3}
                    value={formExpertise}
                    onChange={(e) => setFormExpertise(e.target.value)}
                    placeholder="Artificial Intelligence, Machine Learning, Cloud Architecture..."
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Website URL & Order */}
              <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    เว็บไซต์ส่วนตัว / Google Scholar / ผลงาน
                  </label>
                  <Input
                    value={formWebsiteUrl}
                    onChange={(e) => setFormWebsiteUrl(e.target.value)}
                    placeholder="https://scholar.google.com/citations?user=..."
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    ลำดับการจัดเรียง (ค่าน้อยอยู่หน้า)
                  </label>
                  <Input
                    type="number"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="md:col-span-3 flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="formIsActiveCheck"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <label
                  htmlFor="formIsActiveCheck"
                  className="text-xs text-zinc-700 dark:text-zinc-300 font-medium cursor-pointer"
                >
                  เปิดแสดงผลในหน้าทำเนียบบุคลากร
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                variant="secondary"
                onClick={() => setIsOpenModal(false)}
                disabled={pending}
                className="text-xs"
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleSavePersonnel}
                disabled={pending}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
              >
                {pending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Manage Departments */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {t("personnel.manageDepartments")}
              </h3>
              <button
                onClick={() => setIsDeptModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                {editingDept ? "แก้ไขฝ่าย" : "เพิ่มฝ่าย/ภาควิชาใหม่"}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    ชื่อฝ่าย (ไทย) *
                  </label>
                  <Input
                    value={deptNameTh}
                    onChange={(e) => handleAutoSlug(e.target.value)}
                    placeholder="เช่น ภาควิชาวิทยาการคอมพิวเตอร์"
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    ชื่อฝ่าย (EN)
                  </label>
                  <Input
                    value={deptNameEn}
                    onChange={(e) => setDeptNameEn(e.target.value)}
                    placeholder="Department of Computer Science"
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Slug URL *
                  </label>
                  <Input
                    value={deptSlug}
                    onChange={(e) => setDeptSlug(e.target.value)}
                    placeholder="computer-science"
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    ลำดับการจัดเรียง
                  </label>
                  <Input
                    type="number"
                    value={deptOrder}
                    onChange={(e) => setDeptOrder(Number(e.target.value))}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                {editingDept && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingDept(null);
                      setDeptNameTh("");
                      setDeptNameEn("");
                      setDeptSlug("");
                    }}
                    className="text-xs h-8"
                  >
                    ยกเลิกการแก้ไข
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleSaveDept}
                  disabled={pending}
                  className="text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editingDept ? "บันทึกการแก้ไข" : "เพิ่มฝ่าย"}
                </Button>
              </div>
            </div>

            {/* Existing Departments List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                รายการฝ่ายทั้งหมด ({departments.length})
              </span>
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
                {departments.map((d) => (
                  <div
                    key={d.id}
                    className="p-3 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                  >
                    <div>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">
                        {d.nameTh}
                      </span>
                      <span className="text-[11px] text-zinc-500 block">
                        {d.nameEn} · Slug: {d.slug} · บุคลากร: {d.personnelCount ?? 0} คน
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditDept(d)}
                        className="p-1.5 text-zinc-500 hover:text-blue-600 rounded"
                        title="แก้ไข"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteDept(d.id)}
                        className="p-1.5 text-zinc-500 hover:text-rose-600 rounded"
                        title="ลบ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Image Cropper (3:4 Ratio) */}
      {isCropModalOpen && cropImageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                  <Crop className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {t("personnel.crop")}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    จัดตำแหน่งภาพถ่ายหน้าตรงบุคลากรให้ได้สัดส่วนมาตรฐาน
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancelCrop}
                disabled={isUploading}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cropper Box */}
            <div className="relative w-full h-80 bg-zinc-950 rounded-xl overflow-hidden shadow-inner">
              <Cropper
                image={cropImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={3 / 4}
                onCropChange={setCrop}
                onCropComplete={(_area, pixels) => setCroppedAreaPixels(pixels)}
                onZoomChange={setZoom}
              />
            </div>

            {/* Zoom Slider */}
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
                className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
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
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
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
