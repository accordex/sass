import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import PayslipsClient from "./PayslipsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Payslips | Softmerce SaaS-BOS" };

const BCrumb = [{ to: "/", title: "Home" }, { title: "Payroll" }, { title: "Payslips" }];

const PayslipsPage = () => (
  <>
    <BreadcrumbComp title="Payslips" items={BCrumb} />
    <PayslipsClient />
  </>
);

export default PayslipsPage;
