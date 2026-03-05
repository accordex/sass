import React from "react";
import type { Metadata } from "next";
import BreadcrumbComp from "../../layout/shared/breadcrumb/BreadcrumbComp";
import Default from "@/app/components/ui-components/Breadcrumb/Default";
import BackgroundBread from "@/app/components/ui-components/Breadcrumb/BackgroundBread";
import ComponentApi from "@/app/components/ui-components/ComponentApi";

export const metadata: Metadata = {
  title: "Ui Breadcrumb",
};

const BCrumb = [
  {
    to: "/",
    title: "Home",
  },
  {
    title: "Breadcrumb",
  },
];

const allApis = [
  {
    id: '1',
    prop: 'icon',
    description: 'An optional icon to display alongside the breadcrumb item.',
    type: `'HiHome'`,
    default: '-',
  },
];

const page = () => {
  return (
    <>
      <BreadcrumbComp title="Breadcrumb" items={BCrumb} />
      <div className="grid grid-cols-12 gap-6">
        {/* Default  */}
        <div className="col-span-12">
          <Default />
        </div>
        {/* background color  */}
        <div className="col-span-12">
          <BackgroundBread />
        </div>
        {/* Api */}
        <div className="col-span-12">
          <ComponentApi allApis={allApis} componentName="Breadcrumb" />
        </div>
      </div>
    </>
  );
};

export default page;
