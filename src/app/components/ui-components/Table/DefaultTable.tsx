'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import DefaultTbl from './Code/DefaultTblCode'
import DefaultTblCode from './Code/DefaultTblCode.tsx?raw'

const DefaultTable = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div className='p-6'>
          <h4 className='text-lg font-semibold mb-4'>Default Table</h4>
          <DefaultTbl />
        </div>
        <CodeDialog>{DefaultTblCode}</CodeDialog>
      </CardBox>
    </div>
  )
}

export default DefaultTable
