'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import WithBackdrop from './Code/WithBackdropCode'
import WithBackdropCode from './Code/WithBackdropCode.tsx?raw'

const DialogWithBackdrop = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Dialog With Backdrop</h4>
            <WithBackdrop />
          </div>
          <CodeDialog>{WithBackdropCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default DialogWithBackdrop
