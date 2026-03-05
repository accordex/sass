'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import DropdownSizes from './Code/DropdownSizesCode'
import DropdownSizesCode from './Code/DropdownSizesCode.tsx?raw'

const DropDownSize = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Dropdown sizes</h4>
            <DropdownSizes />
          </div>
          <CodeDialog>{DropdownSizesCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default DropDownSize
