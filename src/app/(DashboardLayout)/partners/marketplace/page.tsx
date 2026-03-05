import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import MarketplaceClient from "./MarketplaceClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marketplace | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "Marketplace" },
  { title: "Listings" },
];

const MarketplacePage = () => (
  <>
    <BreadcrumbComp title="Marketplace" items={BCrumb} />
    <MarketplaceClient />
  </>
);

export default MarketplacePage;
