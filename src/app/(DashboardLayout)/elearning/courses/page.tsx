import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import CoursesClient from "./CoursesClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courses | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "E-Learning" },
  { title: "Courses" },
];

const CoursesPage = () => (
  <>
    <BreadcrumbComp title="Courses" items={BCrumb} />
    <CoursesClient />
  </>
);

export default CoursesPage;
