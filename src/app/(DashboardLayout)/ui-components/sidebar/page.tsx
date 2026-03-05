import React from 'react'
import type { Metadata } from 'next'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import DefaultSidebar from '@/app/components/ui-components/Sidebar/DefaultSidebar'
import MultilevelDropdown from '@/app/components/ui-components/Sidebar/MultilevelDropdown'
import CustomDropdownIcon from '@/app/components/ui-components/Sidebar/CustomDropdownIcon'
import ContentSeparator from '@/app/components/ui-components/Sidebar/ContentSeparator'
import SidebarWithButton from '@/app/components/ui-components/Sidebar/SidebarWithButton'
import SidebarWithLogo from '@/app/components/ui-components/Sidebar/SidebarWithLogo'
import ComponentApi from '@/app/components/ui-components/ComponentApi'

export const metadata: Metadata = {
  title: 'Ui Sidebar',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Sidebar',
  },
]

const allApis = [
  {
    id: '1',
    prop: 'href',
    description: 'The URL to navigate to when the item is clicked.',
    type: '#',
    default: '-',
  },
  {
    id: '2',
    prop: 'icon',
    description: 'The icon to display alongside the item text.',
    type: `"HiChartPie" | "HiViewBoards"`,
    default: '-',
  },
  {
    id: '3',
    prop: 'label',
    description: 'The label to display as a badge on the item.',
    type: `"Pro"`,
    default: '-',
  },
  {
    id: '4',
    prop: 'labelColor',
    description: 'The background color of the label badge.',
    type: `"dark"`,
    default: 'default',
  },
]

const page = () => {
  return (
    <>
      <BreadcrumbComp title='Sidebar' items={BCrumb} />
      <div className='grid grid-cols-12 gap-6'>
        {/* Default */}
        <div className='col-span-12'>
          <DefaultSidebar />
        </div>
        {/* Multilevel Dropdown */}
        <div className='col-span-12'>
          <MultilevelDropdown />
        </div>
        {/* Custom Dropdown Icon*/}
        <div className='col-span-12'>
          <CustomDropdownIcon />
        </div>
        {/* Content Separator*/}
        <div className='col-span-12'>
          <ContentSeparator />
        </div>
        {/* Sidebar With Button*/}
        <div className='col-span-12'>
          <SidebarWithButton />
        </div>
        {/* Sidebar With Logo*/}
        <div className='col-span-12'>
          <SidebarWithLogo />
        </div>
        {/* Api */}
        <div className='col-span-12'>
          <ComponentApi allApis={allApis} componentName='Sidebar' />
        </div>
      </div>
    </>
  )
}

export default page
