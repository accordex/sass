import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import ConversationsClient from "./ConversationsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Conversations | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "AI Platform" },
  { title: "Conversations" },
];

const ConversationsPage = () => (
  <>
    <BreadcrumbComp title="AI Conversations" items={BCrumb} />
    <ConversationsClient />
  </>
);

export default ConversationsPage;
