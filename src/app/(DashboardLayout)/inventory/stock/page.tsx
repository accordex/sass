import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import StockClient from "./StockClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stock | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "Inventory" },
  { title: "Stock" },
];

const StockPage = () => (
  <>
    <BreadcrumbComp title="Stock Management" items={BCrumb} />
    <StockClient />
  </>
);

export default StockPage;
