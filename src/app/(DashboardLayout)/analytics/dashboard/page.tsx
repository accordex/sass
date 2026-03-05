import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import ExecutiveDashboardClient from "./ExecutiveDashboardClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Executive Dashboard | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "Analytics" },
  { title: "Executive Dashboard" },
];

const ExecutiveDashboardPage = () => (
  <>
    <BreadcrumbComp title="Executive Dashboard" items={BCrumb} />
    <ExecutiveDashboardClient />
  </>
);

export default ExecutiveDashboardPage;
