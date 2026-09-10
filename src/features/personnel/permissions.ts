import type { PermissionDef } from "@/shared/lib/permission-def";

export const PERSONNEL_P = {
  personnelRead: "personnel:read",
  personnelManage: "personnel:manage",
  personnelManageDepartments: "personnel:manage_departments",
} as const;

export const PERSONNEL_PERMISSIONS: readonly PermissionDef[] = [
  { code: PERSONNEL_P.personnelRead, module: "personnel", action: "read", description: "ดูข้อมูลและรายชื่อบุคลากร" },
  { code: PERSONNEL_P.personnelManage, module: "personnel", action: "manage", description: "จัดการข้อมูลบุคลากร (สร้าง/แก้ไข/ลบ/จัดเรียง)" },
  { code: PERSONNEL_P.personnelManageDepartments, module: "personnel", action: "manage_departments", description: "จัดการฝ่ายและภาควิชาบุคลากร" },
];
