import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import PartnersClient from "./PartnersClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partners | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "Partner Program" },
  { title: "Partners" },
];

const PartnersPage = () => (
  <>
    <BreadcrumbComp title="Partners" items={BCrumb} />
    <PartnersClient />
  </>
);

export default PartnersPage;
