'use client'

import CardBox from '@/app/components/shared/CardBox'
import FramerMotion from './Code/FramerMotionCode'
import FramerMotionCode from './Code/FramerMotionCode.tsx?raw'
import CodeDialog from '../../ui-components/CodeDialog'

const FramerDiclosure = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>
              Disclosure With Framer Motion
            </h4>
            <FramerMotion />
          </div>
          <CodeDialog>{FramerMotionCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default FramerDiclosure
