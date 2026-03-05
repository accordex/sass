'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import AllOption from './Code/AllOptionscode'
import AllOptioncode from './Code/AllOptionscode.tsx?raw'

const AllOptions = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>All Options</h4>
            <AllOption />
          </div>
          <CodeDialog>{AllOptioncode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default AllOptions
