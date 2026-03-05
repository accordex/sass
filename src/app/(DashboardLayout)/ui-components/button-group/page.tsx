import React from 'react'
import type { Metadata } from 'next'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import DefaultGroup from '@/app/components/ui-components/ButtonGroup/DefaultGroup'
import OutlineButtonGroup from '@/app/components/ui-components/ButtonGroup/OutlineButtonGroup'
import ColorOptions from '@/app/components/ui-components/ButtonGroup/ColorOptions'
import GroupWithIcon from '@/app/components/ui-components/ButtonGroup/GroupWithIcon'
import ComponentApi from '@/app/components/ui-components/ComponentApi'

export const metadata: Metadata = {
  title: 'Ui Button Group',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Button Group',
  },
]

const allApis = [
  {
    id: '1',
    prop: 'outline',
    description: 'Making buttons border-only with transparent backgrounds.',
    type: 'boolean',
    default: 'false',
  },
  {
    id: '2',
    prop: 'color',
    description: 'Specifies the color scheme of the buttons within the group.',
    type: `'primary' | 'secondary' | 'success' | 'warning'`,
    default: 'Default',
  },
]

const page = () => {
  return (
    <>
      <BreadcrumbComp title='Button Group' items={BCrumb} />
      <div className='grid grid-cols-12 gap-6'>
        {/* Default */}
        <div className='col-span-12'>
          <DefaultGroup />
        </div>
        {/* Outline Button Group */}
        <div className='col-span-12'>
          <OutlineButtonGroup />
        </div>
        {/* Color Options */}
        <div className='col-span-12'>
          <ColorOptions />
        </div>
        {/* Group With Icon */}
        <div className='col-span-12'>
          <GroupWithIcon />
        </div>
        {/* Api */}
        <div className='col-span-12'>
          <ComponentApi allApis={allApis} componentName='Button Group' />
        </div>
      </div>
    </>
  )
}

export default page
