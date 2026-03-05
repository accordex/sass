'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import WithTextRatings from './Code/WithTextRatingsCode'
import WithTextRatingsCode from './Code/WithTextRatingsCode.tsx?raw'

const WithTextRattings = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Rating With Text</h4>
            <WithTextRatings />
          </div>
          <CodeDialog>{WithTextRatingsCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default WithTextRattings
