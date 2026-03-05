'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import FramerMotionDialog from './Code/FramerMotionDialogCode'
import FramerMotionDialogCode from './Code/FramerMotionDialogCode.tsx?raw'

const FramerAnimationDialog = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Framer Motion Dialog</h4>
            <FramerMotionDialog />
          </div>
          <CodeDialog>{FramerMotionDialogCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default FramerAnimationDialog
