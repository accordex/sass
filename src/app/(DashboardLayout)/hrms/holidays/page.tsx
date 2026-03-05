import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import HolidaysClient from "./HolidaysClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Holidays | Softmerce SaaS-BOS" };

const BCrumb = [{ to: "/", title: "Home" }, { title: "HRMS" }, { title: "Holidays" }];

const HolidaysPage = () => (
  <>
    <BreadcrumbComp title="Holiday Calendar" items={BCrumb} />
    <HolidaysClient />
  </>
);

export default HolidaysPage;
