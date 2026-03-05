'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import Comboposition from './Codes/ComboPositionCode'
import CombopositionCode from './Codes/ComboPositionCode.tsx?raw'

const ComboPosition = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Dropdown Position</h4>
            <Comboposition />
          </div>
          <CodeDialog>{CombopositionCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default ComboPosition
