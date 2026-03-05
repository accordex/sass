'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import AdditionalAlert from './Code/AdditionalAlertCode'
import AdditionalAlertCode from './Code/AdditionalAlertCode.tsx?raw'

const Additional = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Additional Content</h4>
            <AdditionalAlert />
          </div>
          <CodeDialog>{AdditionalAlertCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default Additional
