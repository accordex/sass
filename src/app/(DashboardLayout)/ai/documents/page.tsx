import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import RAGDocumentsClient from "./RAGDocumentsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knowledge Base | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "AI Platform" },
  { title: "Knowledge Base" },
];

const RAGDocumentsPage = () => (
  <>
    <BreadcrumbComp title="Knowledge Base (RAG Documents)" items={BCrumb} />
    <RAGDocumentsClient />
  </>
);

export default RAGDocumentsPage;
