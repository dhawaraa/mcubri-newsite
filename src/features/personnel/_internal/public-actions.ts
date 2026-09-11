"use server";

import { prisma } from "@/shared/lib/infra/prisma";
import type { DepartmentDto, PersonnelDto } from "./services";
import type { PersonnelType, Prisma } from "@/generated/prisma";

export interface PublicPersonnelPageData {
  tenant: {
    id: string;
    nameTh: string;
    nameEn: string;
  } | null;
  departments: DepartmentDto[];
  personnels: PersonnelDto[];
}

export async function getPublicPersonnelDataAction(options?: {
  departmentSlug?: string;
  type?: PersonnelType;
}): Promise<PublicPersonnelPageData> {
  const tenant = await prisma.tenant.findFirst({
    where: { isActive: true },
    select: { id: true, nameTh: true, nameEn: true },
  });

  if (!tenant) {
    return { tenant: null, departments: [], personnels: [] };
  }

  const depts = await prisma.personnelDepartment.findMany({
    where: { tenantId: tenant.id, isActive: true },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });

  const where: Prisma.PersonnelWhereInput = {
    tenantId: tenant.id,
    isActive: true,
  };

  if (options?.departmentSlug && options.departmentSlug !== "ALL") {
    const matchedDept = depts.find((d) => d.slug === options.departmentSlug);
    if (matchedDept) {
      where.departmentId = matchedDept.id;
    }
  }

  if (options?.type) {
    where.type = options.type;
  }

  const list = await prisma.personnel.findMany({
    where,
    orderBy: [
      { displayOrder: "asc" },
      { createdAt: "asc" },
    ],
    include: {
      department: true,
    },
  });

  return {
    tenant,
    departments: depts.map((d) => ({
      id: d.id,
      nameTh: d.nameTh,
      nameEn: d.nameEn,
      slug: d.slug,
      description: d.description,
      displayOrder: d.displayOrder,
      isActive: d.isActive,
    })),
    personnels: list.map((p) => ({
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
    })),
  };
}
