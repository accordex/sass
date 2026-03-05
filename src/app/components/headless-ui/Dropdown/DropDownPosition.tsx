'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import Dropdownposition from './Codes/DropdownPositionCode'
import DropdownpositionCode from './Codes/DropdownPositionCode.tsx?raw'

const DropDownPosition = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Position</h4>
            <Dropdownposition />
          </div>
          <CodeDialog>{DropdownpositionCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default DropDownPosition
