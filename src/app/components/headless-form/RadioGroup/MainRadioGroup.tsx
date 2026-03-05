'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import MainRadiogroup from './Codes/MainRadioGroupCode'
import MainRadiogroupCode from './Codes/MainRadioGroupCode.tsx?raw'

const MainRadioGroup = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Simple Radio Group </h4>
            <MainRadiogroup />
          </div>
          <CodeDialog>{MainRadiogroupCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default MainRadioGroup
