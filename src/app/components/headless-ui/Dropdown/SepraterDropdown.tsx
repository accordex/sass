'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import SepratingItems from './Codes/SepratingItemsCode'
import SepratingItemsCode from './Codes/SepratingItemsCode.tsx?raw'

const SepratorDropdown = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Separating Items</h4>
            <SepratingItems />
          </div>
          <CodeDialog>{SepratingItemsCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default SepratorDropdown
