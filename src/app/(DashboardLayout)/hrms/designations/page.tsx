import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import DesignationsClient from "./DesignationsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Designations | Softmerce SaaS-BOS" };

const BCrumb = [{ to: "/", title: "Home" }, { title: "HRMS" }, { title: "Designations" }];

const DesignationsPage = () => (
  <>
    <BreadcrumbComp title="Designations" items={BCrumb} />
    <DesignationsClient />
  </>
);

export default DesignationsPage;
