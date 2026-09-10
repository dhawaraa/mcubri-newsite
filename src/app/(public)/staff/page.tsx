import { getPublicPersonnelDataAction } from "@/features/personnel/actions";
import { PortalNav } from "../_components/portal-nav";
import { PublicPersonnelClient } from "./_components/public-personnel-client";

export default async function PublicPersonnelPage() {
  const data = await getPublicPersonnelDataAction();

  return (
    <>
      <PortalNav
        tenantNameTh={data.tenant?.nameTh}
        tenantNameEn={data.tenant?.nameEn}
      />
      <PublicPersonnelClient
        initialDepartments={data.departments}
        initialPersonnels={data.personnels}
      />
    </>
  );
}
