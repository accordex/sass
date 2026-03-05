'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import ComboWithLable from './Codes/ComboWithLableCode'
import ComboWithLableCode from './Codes/ComboWithLableCode.tsx?raw'

const WithLabel = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>With Label</h4>
            <ComboWithLable />
          </div>
          <CodeDialog>{ComboWithLableCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default WithLabel
