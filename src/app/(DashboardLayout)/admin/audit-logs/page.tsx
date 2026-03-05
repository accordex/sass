import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import AuditLogsClient from "./AuditLogsClient";
import type { Metadata } from "next";

// ==============================================================================
// Audit Trail Page (Server Component)
// ==============================================================================
// Read-only view of all system activities for compliance and monitoring.
// Supports filtering by action, resource type, user, and date range.
// ==============================================================================

export const metadata: Metadata = {
  title: "Audit Trail | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "Audit Trail" },
];

const AuditLogsPage = () => {
  return (
    <>
      <BreadcrumbComp title="Audit Trail" items={BCrumb} />
      <AuditLogsClient />
    </>
  );
};

export default AuditLogsPage;
