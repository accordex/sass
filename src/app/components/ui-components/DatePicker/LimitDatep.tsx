'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Limitdatep from './Code/LimitDatepCode'
import LimitdatepCode from './Code/LimitDatepCode.tsx?raw'

const LimitDatep = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Limit The Date</h4>
            <Limitdatep />
          </div>
          <CodeDialog>{LimitdatepCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default LimitDatep
