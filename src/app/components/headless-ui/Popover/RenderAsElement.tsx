'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import RenderPopover from './Code/RenderPopoverCode'
import RenderPopoverCode from './Code/RenderPopoverCode.tsx?raw'

const RenderAsElement = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>
              Rendering Different Elements
            </h4>
            <RenderPopover />
          </div>
          <CodeDialog>{RenderPopoverCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default RenderAsElement
