import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import EnrollmentsClient from "./EnrollmentsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enrollments | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "E-Learning" },
  { title: "Enrollments" },
];

const EnrollmentsPage = () => (
  <>
    <BreadcrumbComp title="Enrollments" items={BCrumb} />
    <EnrollmentsClient />
  </>
);

export default EnrollmentsPage;
