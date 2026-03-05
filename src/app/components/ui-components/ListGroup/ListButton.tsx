'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Listbutton from './Code/ListButtonCode'
import ListbuttonCode from './Code/ListButtonCode.tsx?raw'

const ListButton = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>
              List group with buttons
            </h4>
            <Listbutton />
          </div>
          <CodeDialog>{ListbuttonCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default ListButton
