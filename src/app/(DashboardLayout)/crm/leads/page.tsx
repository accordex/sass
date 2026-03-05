import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import LeadsClient from "./LeadsClient";
import type { Metadata } from "next";

// ==============================================================================
// Leads Management Page (Server Component)
// ==============================================================================
// CRM lead pipeline — list, filter, search, convert leads to customers.
// ==============================================================================

export const metadata: Metadata = {
  title: "Lead Management | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "CRM" },
  { title: "Leads" },
];

const LeadsPage = () => {
  return (
    <>
      <BreadcrumbComp title="Lead Management" items={BCrumb} />
      <LeadsClient />
    </>
  );
};

export default LeadsPage;
