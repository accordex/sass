import React from 'react'
import type { Metadata } from 'next'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import DefaultNav from '@/app/components/ui-components/Navbar/DefaultNav'
import CTANav from '@/app/components/ui-components/Navbar/CTANav'
import NavWithDropdown from '@/app/components/ui-components/Navbar/NavWithDropdown'
import ComponentApi from '@/app/components/ui-components/ComponentApi'

export const metadata: Metadata = {
  title: 'Ui Navbar',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Navbar',
  },
]

const allApis = [
  {
    id: '1',
    prop: 'fluid',
    description: 'If true, the navbar spans the full width of the screen.',
    type: 'boolean',
    default: 'false',
  },
  {
    id: '2',
    prop: 'rounded',
    description: 'Applies rounded corners to the navbar.',
    type: 'boolean',
    default: 'false',
  },
  {
    id: '3',
    prop: 'href',
    description: 'Destination URL of the link.',
    type: 'string',
    default: '-',
  },
  {
    id: '4',
    prop: 'active',
    description: 'Marks the link as active (highlighted).',
    type: 'boolean',
    default: 'false',
  },
]

const page = () => {
  return (
    <>
      <BreadcrumbComp title='Navbar' items={BCrumb} />
      <div className='grid grid-cols-12 gap-6'>
        {/* Default Navbar*/}
        <div className='col-span-12'>
          <DefaultNav />
        </div>
        {/* CTA Navbar */}
        <div className='col-span-12'>
          <CTANav />
        </div>
        {/* Nav With Dropdown */}
        <div className='col-span-12'>
          <NavWithDropdown />
        </div>
        {/* Api */}
        <div className='col-span-12'>
          <ComponentApi allApis={allApis} componentName='Navbar' />
        </div>
      </div>
    </>
  )
}

export default page
