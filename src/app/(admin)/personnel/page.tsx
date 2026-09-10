import { requirePermission, hasPermission } from "@/features/identity/server";
import { PERSONNEL_P } from "@/features/personnel";
import { PersonnelClient } from "./_components/personnel-client";

export default async function PersonnelPage() {
  const ctx = await requirePermission(PERSONNEL_P.personnelRead);

  return (
    <PersonnelClient
      canManage={hasPermission(ctx, PERSONNEL_P.personnelManage)}
      canManageDepartments={hasPermission(ctx, PERSONNEL_P.personnelManageDepartments)}
    />
  );
}
