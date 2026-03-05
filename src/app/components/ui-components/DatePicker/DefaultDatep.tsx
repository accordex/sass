'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Defaultdatep from './Code/DefaultDatepCode'
import DefaultdatepCode from './Code/DefaultDatepCode.tsx?raw'

const DefaultDatep = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Default Datepicker</h4>
            <Defaultdatep />
          </div>
          <CodeDialog>{DefaultdatepCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default DefaultDatep
