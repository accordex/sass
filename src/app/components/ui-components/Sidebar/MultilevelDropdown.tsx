'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Multileveldropdown from './Code/MultilevelDropdownCode'
import MultileveldropdownCode from './Code/MultilevelDropdownCode.tsx?raw'

const MultilevelDropdown = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Multi-level dropdown</h4>
            <Multileveldropdown />
          </div>
          <CodeDialog>{MultileveldropdownCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default MultilevelDropdown
