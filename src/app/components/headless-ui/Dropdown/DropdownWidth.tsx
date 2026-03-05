'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import Dropdwonwidth from './Codes/DropdwonWidthCode'
import DropdwonwidthCode from './Codes/DropdwonWidthCode.tsx?raw'

const DropdownWidth = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Dropdown Width</h4>
            <Dropdwonwidth />
          </div>
          <CodeDialog>{DropdwonwidthCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default DropdownWidth
