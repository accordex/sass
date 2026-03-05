import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import EmployeesClient from "./EmployeesClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Employees | Softmerce SaaS-BOS" };

const BCrumb = [{ to: "/", title: "Home" }, { title: "HRMS" }, { title: "Employees" }];

const EmployeesPage = () => (
  <>
    <BreadcrumbComp title="Employee Management" items={BCrumb} />
    <EmployeesClient />
  </>
);

export default EmployeesPage;
