'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import Basicdropdown from './Codes/BasicDropdownCode'
import BasicdropdownCode from './Codes/BasicDropdownCode.tsx?raw'

const BasicDropdown = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Basic Dropdown</h4>
            <Basicdropdown />
          </div>
          <CodeDialog>{BasicdropdownCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default BasicDropdown
