import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import CommissionsClient from "./CommissionsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Commissions | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "Partner Program" },
  { title: "Commissions" },
];

const CommissionsPage = () => (
  <>
    <BreadcrumbComp title="Commissions" items={BCrumb} />
    <CommissionsClient />
  </>
);

export default CommissionsPage;
