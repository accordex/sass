'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import Basictransaction from './Codes/BasicTransactionCode'
import BasictransactionCode from './Codes/BasicTransactionCode.tsx?raw'

const BasicTransition = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Basic Transition</h4>
            <Basictransaction />
          </div>
          <CodeDialog>{BasictransactionCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default BasicTransition
