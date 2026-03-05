import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import DealsClient from "./DealsClient";
import type { Metadata } from "next";

// ==============================================================================
// Deals & Pipelines Page (Server Component)
// ==============================================================================
// CRM deal management — pipeline view, deal list, filter by stage and owner.
// ==============================================================================

export const metadata: Metadata = {
  title: "Deals & Pipelines | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "CRM" },
  { title: "Deals & Pipelines" },
];

const DealsPage = () => {
  return (
    <>
      <BreadcrumbComp title="Deals & Pipelines" items={BCrumb} />
      <DealsClient />
    </>
  );
};

export default DealsPage;
