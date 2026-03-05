import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import AttendanceClient from "./AttendanceClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Attendance | Softmerce SaaS-BOS" };

const BCrumb = [{ to: "/", title: "Home" }, { title: "HRMS" }, { title: "Attendance" }];

const AttendancePage = () => (
  <>
    <BreadcrumbComp title="Attendance Management" items={BCrumb} />
    <AttendanceClient />
  </>
);

export default AttendancePage;
