'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import DisableCheck from './Codes/DisableCheckCode'
import DisableCheckCode from './Codes/DisableCheckCode.tsx?raw'

const DisableCheckBox = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Disable Checkbox</h4>
            <DisableCheck />
          </div>
          <CodeDialog>{DisableCheckCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default DisableCheckBox
