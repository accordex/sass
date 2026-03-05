'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import Basicdisclosure from './Code/BasicDisclosureCode'
import BasicdisclosureCode from './Code/BasicDisclosureCode.tsx?raw'

const BasicDisclosure = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Basic Disclosure</h4>
            <Basicdisclosure />
          </div>
          <CodeDialog>{BasicdisclosureCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default BasicDisclosure
