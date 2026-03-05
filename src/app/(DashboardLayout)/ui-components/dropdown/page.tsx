import React from 'react'
import type { Metadata } from 'next'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import DropDownHeader from '@/app/components/ui-components/Dropdown/DropdownHeader'
import DropdownWithIcon from '@/app/components/ui-components/Dropdown/DropdownWithIcon'
import DropDownSize from '@/app/components/ui-components/Dropdown/DropDownSize'
import DropdownPalcements from '@/app/components/ui-components/Dropdown/DropdownPlacements'
import ComponentApi from '@/app/components/ui-components/ComponentApi'

export const metadata: Metadata = {
  title: 'Ui Dropdown',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Dropdown',
  },
]

const allApis = [
  {
    id: '1',
    prop: 'label',
    description: 'Sets the text label for the dropdown trigger.',
    type: 'string',
    default: '-',
  },
  {
    id: '2',
    prop: 'size',
    description: 'Controls the size of the dropdown.',
    type: `"sm" | "md" | "lg"`,
    default: `"md"`,
  },
  {
    id: '3',
    prop: 'placement',
    description: 'Sets the placement of the dropdown relative to the trigger.',
    type: `"top" | "right" | "bottom" | "left"`,
    default: `"bottom"`,
  },
  {
    id: '4',
    prop: 'inline',
    description: 'Makes the dropdown appear inline with the trigger element.',
    type: 'boolean',
    default: `false`,
  },
]

const page = () => {
  return (
    <>
      <BreadcrumbComp title='Dropdown' items={BCrumb} />
      <div className='grid grid-cols-12 gap-6'>
        {/* Default Drodown & Header Dropdown*/}
        <div className='col-span-12'>
          <DropDownHeader />
        </div>
        {/* Drodown with icon*/}
        <div className='col-span-12'>
          <DropdownWithIcon />
        </div>
        {/* Drodown sizes*/}
        <div className='col-span-12'>
          <DropDownSize />
        </div>
        {/* Drodown Placement*/}
        <div className='col-span-12'>
          <DropdownPalcements />
        </div>
        {/* Api */}
        <div className='col-span-12'>
          <ComponentApi allApis={allApis} componentName='Dropdown' />
        </div>
      </div>
    </>
  )
}

export default page
