import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import PaymentReceiptsClient from "./PaymentReceiptsClient";
import type { Metadata } from "next";

// ==============================================================================
// Payment Receipts Page (Server Component)
// ==============================================================================
// Incoming payments received from customers against invoices.
// ==============================================================================

export const metadata: Metadata = {
  title: "Payment Receipts | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "Accounting" },
  { title: "Payments" },
  { title: "Receipts" },
];

const PaymentReceiptsPage = () => {
  return (
    <>
      <BreadcrumbComp title="Payment Receipts" items={BCrumb} />
      <PaymentReceiptsClient />
    </>
  );
};

export default PaymentReceiptsPage;
