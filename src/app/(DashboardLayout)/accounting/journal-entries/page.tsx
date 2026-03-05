import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import JournalEntriesClient from "./JournalEntriesClient";
import type { Metadata } from "next";

// ==============================================================================
// Journal Entries Page (Server Component)
// ==============================================================================
// Accounting journal entries — create, list, search double-entry transactions.
// ==============================================================================

export const metadata: Metadata = {
  title: "Journal Entries | Softmerce SaaS-BOS",
};

const BCrumb = [
  { to: "/", title: "Home" },
  { title: "Accounting" },
  { title: "Journal Entries" },
];

const JournalEntriesPage = () => {
  return (
    <>
      <BreadcrumbComp title="Journal Entries" items={BCrumb} />
      <JournalEntriesClient />
    </>
  );
};

export default JournalEntriesPage;
