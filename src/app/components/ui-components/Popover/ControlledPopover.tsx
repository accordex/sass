'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Controlledpopover from './Code/ControlledPopoverCode'
import ControlledpopoverCode from './Code/ControlledPopoverCode.tsx?raw'

const ControlledPopover = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Controlled</h4>
            <Controlledpopover />
          </div>
          <CodeDialog>{ControlledpopoverCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default ControlledPopover
