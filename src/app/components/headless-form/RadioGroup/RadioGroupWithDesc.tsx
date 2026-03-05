'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import RadioGroupWithdesc from './Codes/RadioGroupWithDescCode'
import RadioGroupWithdescCode from './Codes/RadioGroupWithDescCode.tsx?raw'

const RadioGroupWithDesc = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>With Description</h4>
            <RadioGroupWithdesc />
          </div>
          <CodeDialog>{RadioGroupWithdescCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default RadioGroupWithDesc
