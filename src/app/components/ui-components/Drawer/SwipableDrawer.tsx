'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Swipeable from './Code/SwipeableCode'
import SwipeableCode from './Code/SwipeableCode.tsx?raw'

const SwipableDrawer = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Swipeable</h4>
            <Swipeable />
          </div>
          <CodeDialog>{SwipeableCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default SwipableDrawer
