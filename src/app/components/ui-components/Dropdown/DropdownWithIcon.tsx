'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import DropDownIcon from './Code/DropDownIconCode'
import DropDownIconCode from './Code/DropDownIconCode.tsx?raw'

const DropdownWithIcon = () => {
  return (
    <>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>
              Dropdown items with icon
            </h4>
            <DropDownIcon />
          </div>
          <CodeDialog>{DropDownIconCode}</CodeDialog>
        </div>
      </CardBox>
    </>
  )
}

export default DropdownWithIcon
