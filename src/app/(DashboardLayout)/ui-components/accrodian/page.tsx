import React from 'react'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import BasicAccordion from '@/app/components/ui-components/Accordian/BasicAccordion'
import FlushAccordian from '@/app/components/ui-components/Accordian/FlushAccordion'
import type { Metadata } from 'next'
import ComponentApi from '@/app/components/ui-components/ComponentApi'

export const metadata: Metadata = {
  title: 'Ui Accordion',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Accordion',
  },
]

const allApis = [
  {
    id: '1',
    prop: 'collapseAll',
    description: 'Automatically collapses all accordion panels.',
    type: 'boolean',
    default: `false`,
  },
]

const page = () => {
  return (
    <>
      <BreadcrumbComp title='Accordion' items={BCrumb} />
      <div className='grid grid-cols-12 gap-6'>
        {/* Basic */}
        <div className='col-span-12'>
          <BasicAccordion />
        </div>
        {/* Flush */}
        <div className='col-span-12'>
          <FlushAccordian />
        </div>
        {/* Api */}
        <div className='col-span-12'>
          <ComponentApi allApis={allApis} componentName='Accordion' />
        </div>
      </div>
    </>
  )
}

export default page
