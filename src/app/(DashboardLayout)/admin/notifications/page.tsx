import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import NotificationsClient from "./NotificationsClient";
import type { Metadata } from "next";

// ==============================================================================
// Notifications Page (Server Component)
// ==============================================================================
// Displays all notifications for the current user with filters and actions.
// ==============================================================================

export const metadata: Metadata = {
  title: "Notifications | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "Notifications" },
];

const NotificationsPage = () => {
  return (
    <>
      <BreadcrumbComp title="Notifications" items={BCrumb} />
      <NotificationsClient />
    </>
  );
};

export default NotificationsPage;
