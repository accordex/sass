import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import ProductsClient from "./ProductsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "Inventory" },
  { title: "Products" },
];

const ProductsPage = () => (
  <>
    <BreadcrumbComp title="Products" items={BCrumb} />
    <ProductsClient />
  </>
);

export default ProductsPage;
