'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Defaultlist from './Code/DefaultListCode'
import DefaultlistCode from './Code/DefaultListCode.tsx?raw'

const DefaultList = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Default list group</h4>
            <Defaultlist />
          </div>
          <CodeDialog>{DefaultlistCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default DefaultList
