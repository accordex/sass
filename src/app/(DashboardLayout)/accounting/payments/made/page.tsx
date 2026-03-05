import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import PaymentsMadeClient from "./PaymentsMadeClient";
import type { Metadata } from "next";

// ==============================================================================
// Payments Made Page (Server Component)
// ==============================================================================
// Outgoing payments made to vendors against purchase bills.
// ==============================================================================

export const metadata: Metadata = {
  title: "Payments Made | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "Accounting" },
  { title: "Payments" },
  { title: "Made" },
];

const PaymentsMadePage = () => {
  return (
    <>
      <BreadcrumbComp title="Payments Made" items={BCrumb} />
      <PaymentsMadeClient />
    </>
  );
};

export default PaymentsMadePage;
