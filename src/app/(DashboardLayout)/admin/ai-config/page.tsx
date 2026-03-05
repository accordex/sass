import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import AIConfigContent from "./AIConfigContent";
import type { Metadata } from "next";

// ==============================================================================
// AI Configuration Page (Placeholder for Phase 6)
// ==============================================================================
// This page will contain AI model configuration, autonomous flow settings,
// and predictive analytics tuning once Phase 6 is implemented.
// ==============================================================================

export const metadata: Metadata = {
  title: "AI Configuration | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "AI Configuration" },
];

const AIConfigPage = () => {
  return (
    <>
      <BreadcrumbComp title="AI Configuration" items={BCrumb} />
      <AIConfigContent />
    </>
  );
};

export default AIConfigPage;
