'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Defaultpagination from './Code/DefaultPaginationCode'
import DefaultpaginationCode from './Code/DefaultPaginationCode.tsx?raw'

const DefaultPagination = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Default Pagination</h4>
            <Defaultpagination />
          </div>
          <CodeDialog>{DefaultpaginationCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default DefaultPagination
