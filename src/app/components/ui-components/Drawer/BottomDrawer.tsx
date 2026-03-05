'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Bottomdrawer from './Code/BottomDrawerCode'
import BottomdrawerCode from './Code/BottomDrawerCode.tsx?raw'

const BottomDrawer = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Bottom Drawer</h4>
            <Bottomdrawer />
          </div>
          <CodeDialog>{BottomdrawerCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default BottomDrawer
