'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Defaultsidebar from './Code/DefaultSidebarCode'
import DefaultsidebarCode from './Code/DefaultSidebarCode.tsx?raw'

const DefaultSidebar = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Default Sidebar</h4>
            <Defaultsidebar />
          </div>
          <CodeDialog>{DefaultsidebarCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default DefaultSidebar
