import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import DiscussionsClient from "./DiscussionsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discussions | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "Community" },
  { title: "Discussions" },
];

const DiscussionsPage = () => (
  <>
    <BreadcrumbComp title="Discussions" items={BCrumb} />
    <DiscussionsClient />
  </>
);

export default DiscussionsPage;
