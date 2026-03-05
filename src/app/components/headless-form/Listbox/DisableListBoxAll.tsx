'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import DisableListbox from './Codes/DisableListboxCode'
import DisableListboxCode from './Codes/DisableListboxCode.tsx?raw'

const DisableListAll = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Disable Listbox</h4>
            <DisableListbox />
          </div>
          <CodeDialog>{DisableListboxCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default DisableListAll
