'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import SidebarWithbutton from './Code/SidebarWithButtonCode'
import SidebarWithbuttonCode from './Code/SidebarWithButtonCode.tsx?raw'

const SidebarWithButton = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div className='p-6'>
          <h4 className='text-lg font-semibold mb-4'>Sidebar with button</h4>
          <SidebarWithbutton />
        </div>
        <CodeDialog>{SidebarWithbuttonCode}</CodeDialog>
      </CardBox>
    </div>
  )
}

export default SidebarWithButton
