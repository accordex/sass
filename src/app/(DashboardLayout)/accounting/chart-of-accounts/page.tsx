import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import ChartOfAccountsClient from "./ChartOfAccountsClient";
import type { Metadata } from "next";

// ==============================================================================
// Chart of Accounts Page (Server Component)
// ==============================================================================
// Displays the complete chart of accounts with hierarchy, account codes,
// types, and balances.
// ==============================================================================

export const metadata: Metadata = {
  title: "Chart of Accounts | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "Accounting" },
  { title: "Chart of Accounts" },
];

const ChartOfAccountsPage = () => {
  return (
    <>
      <BreadcrumbComp title="Chart of Accounts" items={BCrumb} />
      <ChartOfAccountsClient />
    </>
  );
};

export default ChartOfAccountsPage;
