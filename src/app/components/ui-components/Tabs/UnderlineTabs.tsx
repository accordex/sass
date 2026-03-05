'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Underlinetabs from './Code/UnderlineTabsCode'
import UnderlinetabsCode from './Code/UnderlineTabsCode.tsx?raw'

const UnderlineTabs = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Tabs With Underline</h4>
            <Underlinetabs />
          </div>
          <CodeDialog>{UnderlinetabsCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default UnderlineTabs
