import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import BankAccountsClient from "./BankAccountsClient";
import type { Metadata } from "next";

// ==============================================================================
// Bank Accounts Page (Server Component)
// ==============================================================================
// Manage company bank accounts for payment reconciliation and tracking.
// ==============================================================================

export const metadata: Metadata = {
  title: "Bank Accounts | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "Accounting" },
  { title: "Bank Accounts" },
];

const BankAccountsPage = () => {
  return (
    <>
      <BreadcrumbComp title="Bank Accounts" items={BCrumb} />
      <BankAccountsClient />
    </>
  );
};

export default BankAccountsPage;
