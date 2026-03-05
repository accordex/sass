import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import PayrollRunsClient from "./PayrollRunsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Payroll Runs | Softmerce SaaS-BOS" };

const BCrumb = [{ to: "/", title: "Home" }, { title: "Payroll" }, { title: "Payroll Runs" }];

const PayrollRunsPage = () => (
  <>
    <BreadcrumbComp title="Payroll Runs" items={BCrumb} />
    <PayrollRunsClient />
  </>
);

export default PayrollRunsPage;
