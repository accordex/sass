import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import CategoriesClient from "./CategoriesClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Categories | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "Inventory" },
  { title: "Product Categories" },
];

const CategoriesPage = () => (
  <>
    <BreadcrumbComp title="Product Categories" items={BCrumb} />
    <CategoriesClient />
  </>
);

export default CategoriesPage;
