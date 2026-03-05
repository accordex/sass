'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Defaultnav from './Code/DefaultNavCode'
import DefaultnavCode from './Code/DefaultNavCode.tsx?raw'

const DefaultNav = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Default Navbar</h4>
            <Defaultnav />
          </div>
          <CodeDialog>{DefaultnavCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default DefaultNav
