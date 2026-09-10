"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { requirePermission } from "@/features/identity/server";
import { PERSONNEL_P } from "../permissions";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getPersonnels,
  createPersonnel,
  updatePersonnel,
  deletePersonnel,
  type DepartmentDto,
  type PersonnelDto,
} from "./services";
import type { PersonnelType } from "@/generated/prisma";

/* ================= Department Actions ================= */
export async function getDepartmentsAction(): Promise<ActionResult<DepartmentDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(PERSONNEL_P.personnelRead);
    return getDepartments(ctx.tenantId);
  });
}

export async function createDepartmentAction(data: {
  nameTh: string;
  nameEn: string;
  slug: string;
  description?: string;
  displayOrder?: number;
}): Promise<ActionResult<DepartmentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(PERSONNEL_P.personnelManageDepartments);
    const res = await createDepartment(ctx.tenantId, data);
    revalidatePath("/personnel");
    return res;
  });
}

export async function updateDepartmentAction(
  id: string,
  data: {
    nameTh?: string;
    nameEn?: string;
    slug?: string;
    description?: string;
    displayOrder?: number;
    isActive?: boolean;
  }
): Promise<ActionResult<DepartmentDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(PERSONNEL_P.personnelManageDepartments);
    const res = await updateDepartment(ctx.tenantId, id, data);
    revalidatePath("/personnel");
    return res;
  });
}

export async function deleteDepartmentAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(PERSONNEL_P.personnelManageDepartments);
    await deleteDepartment(ctx.tenantId, id);
    revalidatePath("/personnel");
  });
}

/* ================= Personnel Actions ================= */
export async function getPersonnelsAction(options?: {
  departmentId?: string;
  type?: PersonnelType;
  isActive?: boolean;
  search?: string;
}): Promise<ActionResult<PersonnelDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(PERSONNEL_P.personnelRead);
    return getPersonnels(ctx.tenantId, options);
  });
}

export async function createPersonnelAction(data: {
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
}): Promise<ActionResult<PersonnelDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(PERSONNEL_P.personnelManage);
    const res = await createPersonnel(ctx.tenantId, data);
    revalidatePath("/personnel");
    return res;
  });
}

export async function updatePersonnelAction(
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
): Promise<ActionResult<PersonnelDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(PERSONNEL_P.personnelManage);
    const res = await updatePersonnel(ctx.tenantId, id, data);
    revalidatePath("/personnel");
    return res;
  });
}

export async function deletePersonnelAction(id: string): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(PERSONNEL_P.personnelManage);
    await deletePersonnel(ctx.tenantId, id);
    revalidatePath("/personnel");
  });
}
