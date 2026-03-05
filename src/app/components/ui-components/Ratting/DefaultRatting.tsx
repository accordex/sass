'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import DefaultRating from './Code/DefaultRatingCode'
import DefaultRatingCode from './Code/DefaultRatingCode.tsx?raw'

const DefaultRatting = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Default rating</h4>
            <DefaultRating />
          </div>
          <CodeDialog>{DefaultRatingCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default DefaultRatting
