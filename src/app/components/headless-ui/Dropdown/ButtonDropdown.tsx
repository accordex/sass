'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import ButtonAction from './Codes/ButtonActionCode'
import ButtonActionCode from './Codes/ButtonActionCode.tsx?raw'

const ButtonDropdown = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Button Action</h4>
            <ButtonAction />
          </div>
          <CodeDialog>{ButtonActionCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default ButtonDropdown
