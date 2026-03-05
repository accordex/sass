import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import RolesClient from "./RolesClient";
import type { Metadata } from "next";

// ==============================================================================
// Roles & Permissions Management Page (Server Component)
// ==============================================================================
// Displays all roles with their assigned permissions.
// Admins can view role details and see permission matrices.
// ==============================================================================

export const metadata: Metadata = {
  title: "Roles & Permissions | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { to: "/admin/users", title: "Admin" },
  { title: "Roles & Permissions" },
];

const RolesPage = () => {
  return (
    <>
      <BreadcrumbComp title="Roles & Permissions" items={BCrumb} />
      <RolesClient />
    </>
  );
};

export default RolesPage;
