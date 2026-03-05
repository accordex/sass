import React from 'react'
import type { Metadata } from 'next'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import DefaultTimeline from '@/app/components/ui-components/Timeline/DefaultTimeline'
import VerticalTimeline from '@/app/components/ui-components/Timeline/VerticalTimeline'
import HorizontalTimeline from '@/app/components/ui-components/Timeline/HorizontalTimeline'
import ComponentApi from '@/app/components/ui-components/ComponentApi'

export const metadata: Metadata = {
  title: 'Ui Timeline',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Timeline',
  },
]

const allApis = [
  {
    id: '1',
    prop: 'horizontal',
    description: 'Arranges the timeline items in a horizontal layout.',
    type: 'boolean',
    default: 'false',
  },
]

const page = () => {
  return (
    <>
      <BreadcrumbComp title='Timeline' items={BCrumb} />
      <div className='grid grid-cols-12 gap-6'>
        {/* Default */}
        <div className=' col-span-12'>
          <DefaultTimeline />
        </div>
        {/* Vertical Timeline */}
        <div className=' col-span-12'>
          <VerticalTimeline />
        </div>
        {/* Horizontal Timeline */}
        <div className=' col-span-12'>
          <HorizontalTimeline />
        </div>
        {/* Api */}
        <div className='col-span-12'>
          <ComponentApi allApis={allApis} componentName='Timeline' />
        </div>
      </div>
    </>
  )
}

export default page
