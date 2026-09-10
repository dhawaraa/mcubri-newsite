import { prisma } from "@/shared/lib/infra/prisma";
import type { PersonnelType } from "@/generated/prisma";

export interface DepartmentDto {
  id: string;
  nameTh: string;
  nameEn: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  personnelCount?: number;
}

export interface PersonnelDto {
  id: string;
  departmentId: string;
  departmentNameTh?: string;
  departmentNameEn?: string;
  departmentSlug?: string;
  type: PersonnelType;
  titleTh: string | null;
  titleEn: string | null;
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
  academicRankTh: string | null;
  academicRankEn: string | null;
  positionTh: string;
  positionEn: string;
  email: string | null;
  phone: string | null;
  officeRoom: string | null;
  education: string | null;
  expertise: string | null;
  websiteUrl: string | null;
  avatarUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
}

/* ================= Departments Service ================= */
export async function getDepartments(tenantId: string): Promise<DepartmentDto[]> {
  const depts = await prisma.personnelDepartment.findMany({
    where: { tenantId },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    include: {
      _count: { select: { personnels: true } },
    },
  });

  return depts.map((d) => ({
    id: d.id,
    nameTh: d.nameTh,
    nameEn: d.nameEn,
    slug: d.slug,
    description: d.description,
    displayOrder: d.displayOrder,
    isActive: d.isActive,
    personnelCount: d._count.personnels,
  }));
}

export async function createDepartment(
  tenantId: string,
  data: {
    nameTh: string;
    nameEn: string;
    slug: string;
    description?: string;
    displayOrder?: number;
  }
): Promise<DepartmentDto> {
  const dept = await prisma.personnelDepartment.create({
    data: {
      tenantId,
      nameTh: data.nameTh,
      nameEn: data.nameEn,
      slug: data.slug,
      description: data.description,
      displayOrder: data.displayOrder ?? 0,
    },
  });

  return {
    id: dept.id,
    nameTh: dept.nameTh,
    nameEn: dept.nameEn,
    slug: dept.slug,
    description: dept.description,
    displayOrder: dept.displayOrder,
    isActive: dept.isActive,
  };
}

export async function updateDepartment(
  tenantId: string,
  id: string,
  data: {
    nameTh?: string;
    nameEn?: string;
    slug?: string;
    description?: string;
    displayOrder?: number;
    isActive?: boolean;
  }
): Promise<DepartmentDto> {
  const dept = await prisma.personnelDepartment.update({
    where: { id, tenantId },
    data: {
      ...(data.nameTh !== undefined ? { nameTh: data.nameTh } : {}),
      ...(data.nameEn !== undefined ? { nameEn: data.nameEn } : {}),
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.displayOrder !== undefined ? { displayOrder: data.displayOrder } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    },
  });

  return {
    id: dept.id,
    nameTh: dept.nameTh,
    nameEn: dept.nameEn,
    slug: dept.slug,
    description: dept.description,
    displayOrder: dept.displayOrder,
    isActive: dept.isActive,
  };
}

export async function deleteDepartment(tenantId: string, id: string): Promise<void> {
  await prisma.personnelDepartment.delete({
    where: { id, tenantId },
  });
}

/* ================= Personnel Service ================= */
export async function getPersonnels(
  tenantId: string,
  options?: {
    departmentId?: string;
    type?: PersonnelType;
    isActive?: boolean;
    search?: string;
  }
): Promise<PersonnelDto[]> {
  const where: any = { tenantId };

  if (options?.departmentId) where.departmentId = options.departmentId;
  if (options?.type) where.type = options.type;
  if (options?.isActive !== undefined) where.isActive = options.isActive;
  if (options?.search) {
    const q = options.search;
    where.OR = [
      { firstNameTh: { contains: q, mode: "insensitive" } },
      { lastNameTh: { contains: q, mode: "insensitive" } },
      { firstNameEn: { contains: q, mode: "insensitive" } },
      { lastNameEn: { contains: q, mode: "insensitive" } },
      { positionTh: { contains: q, mode: "insensitive" } },
      { positionEn: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  const items = await prisma.personnel.findMany({
    where,
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    include: {
      department: true,
    },
  });

  return items.map((p) => ({
    id: p.id,
    departmentId: p.departmentId,
    departmentNameTh: p.department.nameTh,
    departmentNameEn: p.department.nameEn,
    departmentSlug: p.department.slug,
    type: p.type,
    titleTh: p.titleTh,
    titleEn: p.titleEn,
    firstNameTh: p.firstNameTh,
    lastNameTh: p.lastNameTh,
    firstNameEn: p.firstNameEn,
    lastNameEn: p.lastNameEn,
    academicRankTh: p.academicRankTh,
    academicRankEn: p.academicRankEn,
    positionTh: p.positionTh,
    positionEn: p.positionEn,
    email: p.email,
    phone: p.phone,
    officeRoom: p.officeRoom,
    education: p.education,
    expertise: p.expertise,
    websiteUrl: p.websiteUrl,
    avatarUrl: p.avatarUrl,
    displayOrder: p.displayOrder,
    isActive: p.isActive,
    createdAt: p.createdAt,
  }));
}

export async function createPersonnel(
  tenantId: string,
  data: {
    departmentId: string;
    type: PersonnelType;
    titleTh?: string;
    titleEn?: string;
    firstNameTh: string;
    lastNameTh: string;
    firstNameEn: string;
    lastNameEn: string;
    academicRankTh?: string;
    academicRankEn?: string;
    positionTh: string;
    positionEn: string;
    email?: string;
    phone?: string;
    officeRoom?: string;
    education?: string;
    expertise?: string;
    websiteUrl?: string;
    avatarUrl?: string;
    displayOrder?: number;
    isActive?: boolean;
  }
): Promise<PersonnelDto> {
  const p = await prisma.personnel.create({
    data: {
      tenantId,
      departmentId: data.departmentId,
      type: data.type,
      titleTh: data.titleTh,
      titleEn: data.titleEn,
      firstNameTh: data.firstNameTh,
      lastNameTh: data.lastNameTh,
      firstNameEn: data.firstNameEn,
      lastNameEn: data.lastNameEn,
      academicRankTh: data.academicRankTh,
      academicRankEn: data.academicRankEn,
      positionTh: data.positionTh,
      positionEn: data.positionEn,
      email: data.email,
      phone: data.phone,
      officeRoom: data.officeRoom,
      education: data.education,
      expertise: data.expertise,
      websiteUrl: data.websiteUrl,
      avatarUrl: data.avatarUrl,
      displayOrder: data.displayOrder ?? 0,
      isActive: data.isActive ?? true,
    },
    include: { department: true },
  });

  return {
    id: p.id,
    departmentId: p.departmentId,
    departmentNameTh: p.department.nameTh,
    departmentNameEn: p.department.nameEn,
    departmentSlug: p.department.slug,
    type: p.type,
    titleTh: p.titleTh,
    titleEn: p.titleEn,
    firstNameTh: p.firstNameTh,
    lastNameTh: p.lastNameTh,
    firstNameEn: p.firstNameEn,
    lastNameEn: p.lastNameEn,
    academicRankTh: p.academicRankTh,
    academicRankEn: p.academicRankEn,
    positionTh: p.positionTh,
    positionEn: p.positionEn,
    email: p.email,
    phone: p.phone,
    officeRoom: p.officeRoom,
    education: p.education,
    expertise: p.expertise,
    websiteUrl: p.websiteUrl,
    avatarUrl: p.avatarUrl,
    displayOrder: p.displayOrder,
    isActive: p.isActive,
    createdAt: p.createdAt,
  };
}

export async function updatePersonnel(
  tenantId: string,
  id: string,
  data: Partial<{
    departmentId: string;
    type: PersonnelType;
    titleTh: string;
    titleEn: string;
    firstNameTh: string;
    lastNameTh: string;
    firstNameEn: string;
    lastNameEn: string;
    academicRankTh: string;
    academicRankEn: string;
    positionTh: string;
    positionEn: string;
    email: string;
    phone: string;
    officeRoom: string;
    education: string;
    expertise: string;
    websiteUrl: string;
    avatarUrl: string;
    displayOrder: number;
    isActive: boolean;
  }>
): Promise<PersonnelDto> {
  const p = await prisma.personnel.update({
    where: { id, tenantId },
    data,
    include: { department: true },
  });

  return {
    id: p.id,
    departmentId: p.departmentId,
    departmentNameTh: p.department.nameTh,
    departmentNameEn: p.department.nameEn,
    departmentSlug: p.department.slug,
    type: p.type,
    titleTh: p.titleTh,
    titleEn: p.titleEn,
    firstNameTh: p.firstNameTh,
    lastNameTh: p.lastNameTh,
    firstNameEn: p.firstNameEn,
    lastNameEn: p.lastNameEn,
    academicRankTh: p.academicRankTh,
    academicRankEn: p.academicRankEn,
    positionTh: p.positionTh,
    positionEn: p.positionEn,
    email: p.email,
    phone: p.phone,
    officeRoom: p.officeRoom,
    education: p.education,
    expertise: p.expertise,
    websiteUrl: p.websiteUrl,
    avatarUrl: p.avatarUrl,
    displayOrder: p.displayOrder,
    isActive: p.isActive,
    createdAt: p.createdAt,
  };
}

export async function deletePersonnel(tenantId: string, id: string): Promise<void> {
  await prisma.personnel.delete({
    where: { id, tenantId },
  });
}
