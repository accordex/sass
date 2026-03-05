'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import Withlabel from './Codes/WithLabelCode'
import WithlabelCode from './Codes/WithLabelCode.tsx?raw'

const WithLable = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Checkbox Label</h4>
            <Withlabel />
          </div>
          <CodeDialog>{WithlabelCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default WithLable
