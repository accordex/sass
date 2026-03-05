import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import ForumCategoriesClient from "./ForumCategoriesClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forum Categories | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "Community" },
  { title: "Forum Categories" },
];

const ForumCategoriesPage = () => (
  <>
    <BreadcrumbComp title="Forum Categories" items={BCrumb} />
    <ForumCategoriesClient />
  </>
);

export default ForumCategoriesPage;
