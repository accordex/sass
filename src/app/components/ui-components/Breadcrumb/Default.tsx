'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import BDefault from './Code/BDefaultCode'
import BDefaultCode from './Code/BDefaultCode.tsx?raw'

const Default = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Default Breadcrumb</h4>
            <BDefault />
          </div>
          <CodeDialog>{BDefaultCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default Default
