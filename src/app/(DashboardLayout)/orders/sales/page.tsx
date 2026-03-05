import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import SalesOrdersClient from "./SalesOrdersClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sales Orders | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "Orders" },
  { title: "Sales Orders" },
];

const SalesOrdersPage = () => (
  <>
    <BreadcrumbComp title="Sales Orders" items={BCrumb} />
    <SalesOrdersClient />
  </>
);

export default SalesOrdersPage;
