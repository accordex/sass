import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import CourseCategoriesClient from "./CourseCategoriesClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Course Categories | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "E-Learning" },
  { title: "Course Categories" },
];

const CourseCategoriesPage = () => (
  <>
    <BreadcrumbComp title="Course Categories" items={BCrumb} />
    <CourseCategoriesClient />
  </>
);

export default CourseCategoriesPage;
