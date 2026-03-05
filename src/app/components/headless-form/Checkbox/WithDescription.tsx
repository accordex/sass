'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import Withdescription from './Codes/WithDescriptionCode'
import WithdescriptionCode from './Codes/WithDescriptionCode.tsx?raw'

const WithDescription = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>With Discription</h4>
            <Withdescription />
          </div>
          <CodeDialog>{WithdescriptionCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default WithDescription
