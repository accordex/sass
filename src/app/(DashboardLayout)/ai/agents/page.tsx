import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import AIAgentsClient from "./AIAgentsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Agents | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "AI Platform" },
  { title: "AI Agents" },
];

const AIAgentsPage = () => (
  <>
    <BreadcrumbComp title="AI Agents" items={BCrumb} />
    <AIAgentsClient />
  </>
);

export default AIAgentsPage;
