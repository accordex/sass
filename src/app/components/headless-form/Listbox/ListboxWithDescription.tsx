'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import ListDesc from './Codes/ListDescCode'
import ListDescCode from './Codes/ListDescCode.tsx?raw'

const ListboxWithDescription = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>
              Listbox With Description
            </h4>
            <ListDesc />
          </div>
          <CodeDialog>{ListDescCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default ListboxWithDescription
