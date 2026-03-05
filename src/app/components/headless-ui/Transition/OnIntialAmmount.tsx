'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import IntialTransition from './Codes/IntialTransitionCode'
import IntialTransitionCode from './Codes/IntialTransitionCode.tsx?raw'

const OnIntialAmmount = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>
              Transitioning On Initial Mount
            </h4>
            <IntialTransition />
          </div>
          <CodeDialog>{IntialTransitionCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default OnIntialAmmount
