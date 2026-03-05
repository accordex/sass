import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import PlatformInvoicesClient from "./PlatformInvoicesClient";
import type { Metadata } from "next";

// ==============================================================================
// Platform Invoices Page (Server Component)
// ==============================================================================
// Lists all platform-level invoices (subscription billing invoices).
// ==============================================================================

export const metadata: Metadata = {
  title: "Platform Invoices | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { to: "/billing/overview", title: "Billing" },
  { title: "Platform Invoices" },
];

const PlatformInvoicesPage = () => {
  return (
    <>
      <BreadcrumbComp title="Platform Invoices" items={BCrumb} />
      <PlatformInvoicesClient />
    </>
  );
};

export default PlatformInvoicesPage;
