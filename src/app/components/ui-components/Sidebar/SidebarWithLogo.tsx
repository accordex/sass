'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import SidebarWithlogo from './Code/SidebarWithLogoCode'
import SidebarWithlogoCode from './Code/SidebarWithLogoCode.tsx?raw'

const SidebarWithLogo = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Sidebar with logo</h4>
            <SidebarWithlogo />
          </div>
          <CodeDialog>{SidebarWithlogoCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default SidebarWithLogo
