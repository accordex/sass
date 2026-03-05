import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import SalaryStructuresClient from "./SalaryStructuresClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Salary Structures | Softmerce SaaS-BOS" };

const BCrumb = [{ to: "/", title: "Home" }, { title: "Payroll" }, { title: "Salary Structures" }];

const SalaryStructuresPage = () => (
  <>
    <BreadcrumbComp title="Salary Structures" items={BCrumb} />
    <SalaryStructuresClient />
  </>
);

export default SalaryStructuresPage;
