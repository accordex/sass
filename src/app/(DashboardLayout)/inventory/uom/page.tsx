import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import UOMClient from "./UOMClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Units of Measure | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "Inventory" },
  { title: "Units of Measure" },
];

const UOMPage = () => (
  <>
    <BreadcrumbComp title="Units of Measure" items={BCrumb} />
    <UOMClient />
  </>
);

export default UOMPage;
