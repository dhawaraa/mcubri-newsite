import { getPublicPortalDataAction } from "@/features/news/actions";
import { PortalClient } from "./(public)/_components/portal-client";
import { VexHero } from "./(public)/_components/vex-hero";

export default async function HomePage() {
  const data = await getPublicPortalDataAction();

  return (
    <>
      {/* VexHero with Integrated BRI-MCU Liquid Glass Navbar */}
      <VexHero
        tenantNameTh={data.tenant?.nameTh}
        tenantNameEn={data.tenant?.nameEn}
      />

      {/* News & Public Content */}
      <PortalClient
        initialCategories={data.categories}
        initialArticles={data.articles}
      />
    </>
  );
}
