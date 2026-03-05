import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import LeaveRequestsClient from "./LeaveRequestsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Leave Requests | Softmerce SaaS-BOS" };

const BCrumb = [{ to: "/", title: "Home" }, { title: "HRMS" }, { title: "Leave" }, { title: "Requests" }];

const LeaveRequestsPage = () => (
  <>
    <BreadcrumbComp title="Leave Requests" items={BCrumb} />
    <LeaveRequestsClient />
  </>
);

export default LeaveRequestsPage;
