'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import TitleDatepicker from './Code/TitleDatePickerCode'
import TitleDatepickerCode from './Code/TitleDatePickerCode.tsx?raw'

const TitleDatePicker = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>With Title</h4>
            <TitleDatepicker />
          </div>
          <CodeDialog>{TitleDatepickerCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default TitleDatePicker
