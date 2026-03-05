'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import TableData from './Code/TableDataCode'
import TableDataCode from './Code/TableDataCode.tsx?raw'

const TableDataPaginationIcon = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>
              Table Data Navigation
            </h4>
            <TableData />
          </div>
          <CodeDialog>{TableDataCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default TableDataPaginationIcon
