'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Iconbadge from './Code/IconCode'
import IconbadgeCode from './Code/IconCode.tsx?raw'

const IconBadge = () => {
  return (
    <>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Icon Badges</h4>
            <Iconbadge />
          </div>
          <CodeDialog>{IconbadgeCode}</CodeDialog>
        </div>
      </CardBox>
    </>
  )
}

export default IconBadge
