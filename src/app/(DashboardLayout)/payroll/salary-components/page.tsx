import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import SalaryComponentsClient from "./SalaryComponentsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Salary Components | Softmerce SaaS-BOS" };

const BCrumb = [{ to: "/", title: "Home" }, { title: "Payroll" }, { title: "Salary Components" }];

const SalaryComponentsPage = () => (
  <>
    <BreadcrumbComp title="Salary Components" items={BCrumb} />
    <SalaryComponentsClient />
  </>
);

export default SalaryComponentsPage;
