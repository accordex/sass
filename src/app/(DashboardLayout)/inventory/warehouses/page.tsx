import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import WarehousesClient from "./WarehousesClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Warehouses | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "Inventory" },
  { title: "Warehouses" },
];

const WarehousesPage = () => (
  <>
    <BreadcrumbComp title="Warehouses" items={BCrumb} />
    <WarehousesClient />
  </>
);

export default WarehousesPage;
