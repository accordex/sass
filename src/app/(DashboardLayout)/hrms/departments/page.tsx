import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import DepartmentsClient from "./DepartmentsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Departments | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "HRMS" },
  { title: "Departments" },
];

const DepartmentsPage = () => (
  <>
    <BreadcrumbComp title="Departments" items={BCrumb} />
    <DepartmentsClient />
  </>
);

export default DepartmentsPage;
