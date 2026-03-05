'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import DisableBackdrop from './Code/DisableBackDropCode'
import DisableBackdropCode from './Code/DisableBackDropCode.tsx?raw'

const CustomBackDrop = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Disable BackDrop</h4>
            <DisableBackdrop />
          </div>
          <CodeDialog>{DisableBackdropCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default CustomBackDrop
