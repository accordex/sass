import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import SettingsClient from "./SettingsClient";
import type { Metadata } from "next";

// ==============================================================================
// Settings Management Page (Server Component)
// ==============================================================================
// Hierarchical settings: Platform → Tenant → Module → User.
// Admins can view and update settings at the appropriate scope.
// ==============================================================================

export const metadata: Metadata = {
  title: "Settings | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "Settings" },
];

const SettingsPage = () => {
  return (
    <>
      <BreadcrumbComp title="Platform Settings" items={BCrumb} />
      <SettingsClient />
    </>
  );
};

export default SettingsPage;
