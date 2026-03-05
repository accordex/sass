'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import Transitioncheck from './Codes/TransitionCheckCode'
import TransitioncheckCode from './Codes/TransitionCheckCode.tsx?raw'

const TransitionCheckbox = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Transitions Checkbox</h4>
            <Transitioncheck />
          </div>
          <CodeDialog>{TransitioncheckCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default TransitionCheckbox
