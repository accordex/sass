import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import DashboardsClient from "./DashboardsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom Dashboards | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "Analytics" },
  { title: "Dashboards" },
];

const DashboardsPage = () => (
  <>
    <BreadcrumbComp title="Custom Dashboards" items={BCrumb} />
    <DashboardsClient />
  </>
);

export default DashboardsPage;
