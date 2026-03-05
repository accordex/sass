import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import UsersListClient from "./UsersListClient";
import type { Metadata } from "next";

// ==============================================================================
// Users Management Page (Server Component)
// ==============================================================================
// Lists all users within the current tenant.
// Supports search, role filtering, and user actions.
// ==============================================================================

export const metadata: Metadata = {
  title: "User Management | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { to: "/admin/tenants", title: "Admin" },
  { title: "Users" },
];

const UsersPage = () => {
  return (
    <>
      <BreadcrumbComp title="User Management" items={BCrumb} />
      <UsersListClient />
    </>
  );
};

export default UsersPage;
