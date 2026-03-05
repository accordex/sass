'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Defaultmodal from './Code/DefaultModalCode'
import DefaultmodalCode from './Code/DefaultModalCode.tsx?raw'

const DefaultModal = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Default Modal</h4>
            <Defaultmodal />
          </div>
          <CodeDialog>{DefaultmodalCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default DefaultModal
