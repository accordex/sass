'use client'

import CardBox from '../../shared/CardBox'
import BbgColor from './Code/BbgColor'
import BbgColorCode from './Code/BbgColor.tsx?raw'
import CodeDialog from '../CodeDialog'

const BackgroundBread = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold'>Background Color</h4>
            <BbgColor />
          </div>
          <CodeDialog>{BbgColorCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default BackgroundBread
