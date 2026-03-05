'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import FramerPopover from './Code/FramerPopoverCode'
import FramerPopoverCode from './Code/FramerPopoverCode.tsx?raw'

const FramerMotionPopover = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>
              Framer Motion Popover
            </h4>
            <FramerPopover />
          </div>
          <CodeDialog>{FramerPopoverCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default FramerMotionPopover
