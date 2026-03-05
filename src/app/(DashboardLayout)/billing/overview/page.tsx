import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import BillingOverviewClient from "./BillingOverviewClient";
import type { Metadata } from "next";

// ==============================================================================
// Billing Overview Page (Server Component)
// ==============================================================================
// Shows the current subscription status, billing statistics, and a summary
// of platform invoices for the logged-in tenant.
// ==============================================================================

export const metadata: Metadata = {
  title: "Billing Overview | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "Billing Overview" },
];

const BillingOverviewPage = () => {
  return (
    <>
      <BreadcrumbComp title="Billing Overview" items={BCrumb} />
      <BillingOverviewClient />
    </>
  );
};

export default BillingOverviewPage;
