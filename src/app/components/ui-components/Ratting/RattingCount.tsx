'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import RatingCount from './Code/RatingCountCode'
import RatingCountCode from './Code/RatingCountCode.tsx?raw'

const RattingCount = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Rating Count</h4>
            <RatingCount />
          </div>
          <CodeDialog>{RatingCountCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default RattingCount
