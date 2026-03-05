import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import SalesInvoicesClient from "./SalesInvoicesClient";
import type { Metadata } from "next";

// ==============================================================================
// Sales Invoices Page (Server Component)
// ==============================================================================
// Lists sales invoices with filters, search, and CRUD operations.
// ==============================================================================

export const metadata: Metadata = {
  title: "Sales Invoices | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "Accounting" },
  { title: "Sales Invoices" },
];

const SalesInvoicesPage = () => {
  return (
    <>
      <BreadcrumbComp title="Sales Invoices" items={BCrumb} />
      <SalesInvoicesClient />
    </>
  );
};

export default SalesInvoicesPage;
