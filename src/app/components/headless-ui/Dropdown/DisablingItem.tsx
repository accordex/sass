'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import DisableItem from './Codes/DisableItemCode'
import DisableItemCode from './Codes/DisableItemCode.tsx?raw'

const DisablingItem = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Disable Items</h4>
            <DisableItem />
          </div>
          <CodeDialog>{DisableItemCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default DisablingItem
