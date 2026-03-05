import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import PurchaseOrdersClient from "./PurchaseOrdersClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Purchase Orders | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "Orders" },
  { title: "Purchase Orders" },
];

const PurchaseOrdersPage = () => (
  <>
    <BreadcrumbComp title="Purchase Orders" items={BCrumb} />
    <PurchaseOrdersClient />
  </>
);

export default PurchaseOrdersPage;
