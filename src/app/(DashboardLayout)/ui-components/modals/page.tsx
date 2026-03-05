import React from 'react'
import type { Metadata } from 'next'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import DefaultModal from '@/app/components/ui-components/Modals/DefaultModal'
import PopupModal from '@/app/components/ui-components/Modals/PopupModal'
import FormModal from '@/app/components/ui-components/Modals/FormModal'
import SizingModal from '@/app/components/ui-components/Modals/SizingModal'
import PlacementModal from '@/app/components/ui-components/Modals/PlacementModal'
import ComponentApi from '@/app/components/ui-components/ComponentApi'

export const metadata: Metadata = {
  title: 'Ui Modals',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Modals',
  },
]

const allApis = [
  {
    id: '1',
    prop: 'show',
    description: 'Controls the visibility of the modal.',
    type: 'boolean',
    default: 'false',
  },
  {
    id: '2',
    prop: 'onClose',
    description: 'Function to call when the modal is requested to be closed.',
    type: '() => void',
    default: '-',
  },
  {
    id: '3',
    prop: 'size',
    description: 'Sets the size of the modal (e.g., sm, md, lg, xl, 2xl).',
    type: `'sm' | 'md' | 'lg' | 'xl' | '2xl'`,
    default: `'2xl'`,
  },
  {
    id: '4',
    prop: 'popup',
    description: 'Enables popup-style modal (with centered layout).',
    type: 'boolean',
    default: 'false',
  },
  {
    id: '5',
    prop: 'dismissible',
    description: 'If true, adds a close (X) button to the top-right corner.',
    type: 'boolean',
    default: 'true',
  },
  {
    id: '6',
    prop: 'position',
    description: 'Sets the position of the modal on the screen.',
    type: `'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'`,
    default: `'center'`,
  },
]

const page = () => {
  return (
    <>
      <BreadcrumbComp title='Modals' items={BCrumb} />
      <div className='grid grid-cols-12 gap-6'>
        {/* Default */}
        <div className='col-span-12'>
          <DefaultModal />
        </div>
        {/* Popup Modal */}
        <div className='col-span-12'>
          <PopupModal />
        </div>
        {/* Form Modal */}
        <div className='col-span-12'>
          <FormModal />
        </div>
        {/* Placement Modal */}
        <div className='col-span-12'>
          <PlacementModal />
        </div>
        {/* Sizing Modal */}
        <div className='col-span-12'>
          <SizingModal />
        </div>
        {/* Api */}
        <div className='col-span-12'>
          <ComponentApi allApis={allApis} componentName='Modals' />
        </div>
      </div>
    </>
  )
}

export default page
