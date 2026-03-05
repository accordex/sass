import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import LeaveTypesClient from "./LeaveTypesClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Leave Types | Softmerce SaaS-BOS" };

const BCrumb = [{ to: "/", title: "Home" }, { title: "HRMS" }, { title: "Leave" }, { title: "Types" }];

const LeaveTypesPage = () => (
  <>
    <BreadcrumbComp title="Leave Types" items={BCrumb} />
    <LeaveTypesClient />
  </>
);

export default LeaveTypesPage;
