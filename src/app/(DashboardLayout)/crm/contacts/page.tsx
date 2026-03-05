import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import ContactsClient from "./ContactsClient";
import type { Metadata } from "next";

// ==============================================================================
// Contacts Management Page (Server Component)
// ==============================================================================
// CRM contacts — list, filter, search, create and manage contact records.
// ==============================================================================

export const metadata: Metadata = {
  title: "Contacts | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "CRM" },
  { title: "Contacts" },
];

const ContactsPage = () => {
  return (
    <>
      <BreadcrumbComp title="Contact Management" items={BCrumb} />
      <ContactsClient />
    </>
  );
};

export default ContactsPage;
