import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import AutonomousRulesClient from "./AutonomousRulesClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Autonomous Rules | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "AI Platform" },
  { title: "Autonomous Rules" },
];

const AutonomousRulesPage = () => (
  <>
    <BreadcrumbComp title="Autonomous Rules" items={BCrumb} />
    <AutonomousRulesClient />
  </>
);

export default AutonomousRulesPage;
