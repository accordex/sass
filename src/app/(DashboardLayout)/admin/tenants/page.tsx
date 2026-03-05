import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import TenantsListClient from "./TenantsListClient";
import type { Metadata } from "next";

// ==============================================================================
// Tenants Management Page (Server Component)
// ==============================================================================
// Super Admin only — lists all tenants with search, filter, and actions.
// Uses server actions for data fetching and mutations.
// ==============================================================================

export const metadata: Metadata = {
  title: "Tenant Management | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "Tenants" },
];

const TenantsPage = () => {
  return (
    <>
      <BreadcrumbComp title="Tenant Management" items={BCrumb} />
      <TenantsListClient />
    </>
  );
};

export default TenantsPage;
