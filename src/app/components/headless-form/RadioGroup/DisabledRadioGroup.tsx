'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import DisabledRadiogroup from './Codes/DisabledRadioGroupCode'
import DisabledRadiogroupCode from './Codes/DisabledRadioGroupCode.tsx?raw'

const DisabledRadioGroup = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>
              Disabled Radio Group{' '}
            </h4>
            <DisabledRadiogroup />
          </div>
          <CodeDialog>{DisabledRadiogroupCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default DisabledRadioGroup
