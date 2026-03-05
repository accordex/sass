import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import EmployeeSalaryClient from "./EmployeeSalaryClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Employee Salary | Softmerce SaaS-BOS" };

const BCrumb = [{ to: "/", title: "Home" }, { title: "Payroll" }, { title: "Employee Salary" }];

const EmployeeSalaryPage = () => (
  <>
    <BreadcrumbComp title="Employee Salary" items={BCrumb} />
    <EmployeeSalaryClient />
  </>
);

export default EmployeeSalaryPage;
