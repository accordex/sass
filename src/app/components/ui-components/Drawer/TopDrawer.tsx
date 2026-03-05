'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Topdrawer from './Code/TopDrawerCode'
import TopdrawerCode from './Code/TopDrawerCode.tsx?raw'

const TopDrawer = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Top Drawer</h4>
            <Topdrawer />
          </div>
          <CodeDialog>{TopdrawerCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default TopDrawer
