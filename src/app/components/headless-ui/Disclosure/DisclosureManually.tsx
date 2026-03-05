'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import ClosingDisclosure from './Code/ClosingDisclosureCode'
import ClosingDisclosureCode from './Code/ClosingDisclosureCode.tsx?raw'

const DisclosureManually = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>
              Closing Disclosures Manually
            </h4>
            <ClosingDisclosure />
          </div>
          <CodeDialog>{ClosingDisclosureCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default DisclosureManually
