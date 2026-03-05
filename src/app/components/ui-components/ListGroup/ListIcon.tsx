'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Listicon from './Code/ListIconCode'
import ListiconCode from './Code/ListIconCode.tsx?raw'

const ListIcon = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>
              List group with icons
            </h4>
            <Listicon />
          </div>
          <CodeDialog>{ListiconCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default ListIcon
