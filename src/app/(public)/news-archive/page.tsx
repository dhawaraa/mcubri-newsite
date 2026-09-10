import { getPublicPortalDataAction } from "@/features/news/actions";
import { PortalNav } from "../_components/portal-nav";
import { PortalClient } from "../_components/portal-client";

export default async function NewsArchivePage() {
  const data = await getPublicPortalDataAction();

  return (
    <>
      <PortalNav
        tenantNameTh={data.tenant?.nameTh}
        tenantNameEn={data.tenant?.nameEn}
      />
      <div className="pt-4">
        <PortalClient
          initialCategories={data.categories}
          initialArticles={data.articles}
          isFullArchivePage={true}
        />
      </div>
    </>
  );
}
