import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import DecisionsClient from "./DecisionsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Decision Log | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "AI Platform" },
  { title: "Decision Log" },
];

const DecisionsPage = () => (
  <>
    <BreadcrumbComp title="Autonomous Decision Log" items={BCrumb} />
    <DecisionsClient />
  </>
);

export default DecisionsPage;
