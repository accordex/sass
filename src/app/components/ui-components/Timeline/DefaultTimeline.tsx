'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import DefaultTimeLine from './Code/DefaultTimelineCode'
import DefaultTimeLineCode from './Code/DefaultTimelineCode.tsx?raw'

const DefaultTimeline = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Default Timeline</h4>
            <DefaultTimeLine />
          </div>
          <CodeDialog>{DefaultTimeLineCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default DefaultTimeline
