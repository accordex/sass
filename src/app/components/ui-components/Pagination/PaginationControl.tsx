'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import ControlText from './Code/ControlTextCode'
import ControlTextCode from './Code/ControlTextCode.tsx?raw'

const PaginationControl = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>
              Pagination Control Button Text
            </h4>
            <ControlText />
          </div>
          <CodeDialog>{ControlTextCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default PaginationControl
