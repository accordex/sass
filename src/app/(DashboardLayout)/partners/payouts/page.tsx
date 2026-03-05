import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import PayoutsClient from "./PayoutsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner Payouts | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "Partner Program" },
  { title: "Payouts" },
];

const PayoutsPage = () => (
  <>
    <BreadcrumbComp title="Partner Payouts" items={BCrumb} />
    <PayoutsClient />
  </>
);

export default PayoutsPage;
