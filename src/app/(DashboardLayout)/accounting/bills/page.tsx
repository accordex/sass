import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import PurchaseBillsClient from "./PurchaseBillsClient";
import type { Metadata } from "next";

// ==============================================================================
// Purchase Bills Page (Server Component)
// ==============================================================================
// Lists purchase bills with filters, search, and pagination.
// ==============================================================================

export const metadata: Metadata = {
  title: "Purchase Bills | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "Accounting" },
  { title: "Purchase Bills" },
];

const PurchaseBillsPage = () => {
  return (
    <>
      <BreadcrumbComp title="Purchase Bills" items={BCrumb} />
      <PurchaseBillsClient />
    </>
  );
};

export default PurchaseBillsPage;
