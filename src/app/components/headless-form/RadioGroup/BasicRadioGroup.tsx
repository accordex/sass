'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import BasicRadiogroup from './Codes/BasicRadioGroupCode'
import BasicRadiogroupCode from './Codes/BasicRadioGroupCode.tsx?raw'

const BasicRadioGroup = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Styling Radio Group</h4>
            <BasicRadiogroup />
          </div>
          <CodeDialog>{BasicRadiogroupCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default BasicRadioGroup
