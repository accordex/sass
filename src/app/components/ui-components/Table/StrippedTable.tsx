'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import StrippedTbl from './Code/StrippedTblCode'
import StrippedTblCode from './Code/StrippedTblCode.tsx?raw'

const StrippedTable = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div className='p-6'>
          <h4 className='text-lg font-semibold mb-4'>Striped Rows</h4>
          <StrippedTbl />
        </div>
        <CodeDialog>{StrippedTblCode}</CodeDialog>
      </CardBox>
    </div>
  )
}

export default StrippedTable
