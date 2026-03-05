import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import MdfRequestsClient from "./MdfRequestsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MDF Requests | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "Partner Program" },
  { title: "MDF Requests" },
];

const MdfRequestsPage = () => (
  <>
    <BreadcrumbComp title="MDF Requests" items={BCrumb} />
    <MdfRequestsClient />
  </>
);

export default MdfRequestsPage;
