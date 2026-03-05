import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import CertificatesClient from "./CertificatesClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Certificates | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "E-Learning" },
  { title: "Certificates" },
];

const CertificatesPage = () => (
  <>
    <BreadcrumbComp title="Certificates" items={BCrumb} />
    <CertificatesClient />
  </>
);

export default CertificatesPage;
