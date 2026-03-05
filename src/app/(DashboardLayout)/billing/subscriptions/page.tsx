import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import SubscriptionsClient from "./SubscriptionsClient";
import type { Metadata } from "next";

// ==============================================================================
// Subscriptions Management Page (Server Component)
// ==============================================================================
// Admin-level page to view and manage all tenant subscriptions.
// ==============================================================================

export const metadata: Metadata = {
  title: "Subscriptions | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { to: "/billing/overview", title: "Billing" },
  { title: "Subscriptions" },
];

const SubscriptionsPage = () => {
  return (
    <>
      <BreadcrumbComp title="Subscription Management" items={BCrumb} />
      <SubscriptionsClient />
    </>
  );
};

export default SubscriptionsPage;
