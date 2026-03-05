'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import AdvanceRating from './Code/AdvanceRatingCode'
import AdvanceRatingCode from './Code/AdvanceRatingCode.tsx?raw'

const AdvanceRatting = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Advanced Rating</h4>
            <AdvanceRating />
          </div>
          <CodeDialog>{AdvanceRatingCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default AdvanceRatting
