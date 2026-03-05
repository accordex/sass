import React from 'react'
import type { Metadata } from 'next'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import DefaultCusrosel from '@/app/components/ui-components/Curousel/DefaultCusrosel'
import StaticCurosel from '@/app/components/ui-components/Curousel/StaticCurosel'
import SlidingInterval from '@/app/components/ui-components/Curousel/SlidingInterval'
import CustomControl from '@/app/components/ui-components/Curousel/CustomControl'
import Indicators from '@/app/components/ui-components/Curousel/Indicators'
import PauseHover from '@/app/components/ui-components/Curousel/PauseHover'
import SliderContent from '@/app/components/ui-components/Curousel/SliderContent'
import SlideEventChange from '@/app/components/ui-components/Curousel/SlideEventChange'
import ComponentApi from '@/app/components/ui-components/ComponentApi'

export const metadata: Metadata = {
  title: 'Ui Carousel',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Carousel',
  },
]

const allApis = [
  {
    id: '1',
    prop: 'slide',
    description: 'Enable or disable sliding transitions.',
    type: 'boolean',
    default: 'true',
  },
  {
    id: '2',
    prop: 'indicators',
    description: 'Show navigation indicators below the carousel.',
    type: 'boolean',
    default: 'true',
  },
  {
    id: '3',
    prop: 'pauseOnHover',
    description:
      'Pause the carousel on mouse hover (desktop) or touch and hold (mobile).',
    type: 'boolean',
    default: 'false',
  },
  {
    id: '4',
    prop: 'slideInterval',
    description: 'Time interval between slides in milliseconds.',
    type: 'number',
    default: '5000',
  },
  {
    id: '6',
    prop: 'leftControl',
    description: 'Custom left navigation control.',
    type: `'<' | 'left' `,
    default: '-',
  },
  {
    id: '7',
    prop: 'rightControl',
    description: 'Custom right navigation control.',
    type: `'>' | 'right'`,
    default: '-',
  },
  {
    id: '8',
    prop: 'onSlideChange',
    description: 'Callback function when the slide changes.',
    type: `'(index) => console.log("onSlideChange()", index)'`,
    default: '-',
  },
  {
    id: '9',
    prop: 'activeIndex',
    description: 'Manually control the active slide index.',
    type: 'number',
    default: '-',
  },
]

const page = () => {
  return (
    <>
      <BreadcrumbComp title='Carousel' items={BCrumb} />
      <div className='grid grid-cols-12 gap-6'>
        {/* Default */}
        <div className='col-span-12'>
          <DefaultCusrosel />
        </div>
        {/* Static Curosel */}
        <div className='col-span-12'>
          <StaticCurosel />
        </div>
        {/* Sliding Interval */}
        <div className='col-span-12'>
          <SlidingInterval />
        </div>
        {/* Custom Control */}
        <div className='col-span-12'>
          <CustomControl />
        </div>
        {/* Indicators */}
        <div className='col-span-12'>
          <Indicators />
        </div>
        {/* Pause On Hover */}
        <div className='col-span-12'>
          <PauseHover />
        </div>
        {/* Slider Content */}
        <div className='col-span-12'>
          <SliderContent />
        </div>
        {/* Slide Event Change */}
        <div className='col-span-12'>
          <SlideEventChange />
        </div>
        {/* Api */}
        <div className='col-span-12'>
          <ComponentApi allApis={allApis} componentName='Carousel' />
        </div>
      </div>
    </>
  )
}

export default page
