import React from 'react'
import type { Metadata } from 'next'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import DefaultSpinner from '@/app/components/ui-components/Spinner/DefaultSpinner'
import ColorSpinner from '@/app/components/ui-components/Spinner/ColorSpinner'
import SizingSpinner from '@/app/components/ui-components/Spinner/SizingSpinner'
import AlignSpinner from '@/app/components/ui-components/Spinner/AlignSpinner'
import LoadButton from '@/app/components/ui-components/Spinner/LoadButton'
import ComponentApi from '@/app/components/ui-components/ComponentApi'

export const metadata: Metadata = {
  title: 'Ui Spinner',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Spinner',
  },
]

const allApis = [
  {
    id: '1',
    prop: 'color',
    description: 'Sets the color of the spinner.',
    type: `'info' | 'success' | 'warning' | 'purple'`,
    default: `'default'`,
  },
  {
    id: '2',
    prop: 'size',
    description: 'Determines the size of the spinner.',
    type: `'xs' | 'sm' | 'md' | 'lg' | 'xl'`,
    default: `'md'`,
  },
]

const page = () => {
  return (
    <>
      <BreadcrumbComp title='Spinner' items={BCrumb} />
      <div className='grid grid-cols-12 gap-6'>
        {/* Default */}
        <div className='col-span-12'>
          <DefaultSpinner />
        </div>
        {/* Color Spinner */}
        <div className='col-span-12'>
          <ColorSpinner />
        </div>
        {/* Sizing Spinner */}
        <div className='col-span-12'>
          <SizingSpinner />
        </div>
        {/* Align Spinner */}
        <div className='col-span-12'>
          <AlignSpinner />
        </div>
        {/* Load Button */}
        <div className='col-span-12'>
          <LoadButton />
        </div>
        {/* Api */}
        <div className='col-span-12'>
          <ComponentApi allApis={allApis} componentName='Spinner' />
        </div>
      </div>
    </>
  )
}

export default page
