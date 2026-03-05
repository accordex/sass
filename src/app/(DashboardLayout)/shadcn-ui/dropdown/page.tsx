import React from 'react'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import { Metadata } from 'next';
import BasicDropdown from '@/app/components/shadcn-ui/Dropdown/BasicDropdown';
import DropdownWithRadio from '@/app/components/shadcn-ui/Dropdown/DropdownWithRadio';
import { DropdownMenuCheckboxes } from '@/app/components/shadcn-ui/Dropdown/DropdownMenuCheckboxes';

export const metadata: Metadata = {
    title: "Ui Dropdown",
  };
  
  const BCrumb = [
    {
      to: "/",
      title: "Home",
    },
    {
      title: "Dropdown",
    },
  ];
  
const page = () => {
  return (
    <>
    <BreadcrumbComp title="Dropdown" items={BCrumb} />
    <div className="grid grid-cols-12 gap-5 sm:gap-30">
      {/* Basic */}
      <div className="col-span-12">
        <BasicDropdown />
      </div>
      <div className="col-span-12">
        <DropdownWithRadio />
      </div>
      <div className="col-span-12">
        <DropdownMenuCheckboxes />
      </div>

    </div>
  </>
  )
}

export default page