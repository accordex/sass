import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import CustomersClient from "./CustomersClient";
import type { Metadata } from "next";

// ==============================================================================
// Customers Management Page (Server Component)
// ==============================================================================
// CRM customers — list, filter, search, manage customer records.
// ==============================================================================

export const metadata: Metadata = {
  title: "Customer Management | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "CRM" },
  { title: "Customers" },
];

const CustomersPage = () => {
  return (
    <>
      <BreadcrumbComp title="Customer Management" items={BCrumb} />
      <CustomersClient />
    </>
  );
};

export default CustomersPage;
