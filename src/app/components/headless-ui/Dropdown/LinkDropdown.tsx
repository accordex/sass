'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import LinkDropDown from './Codes/LinkDropdownCode'
import LinkDropDownCode from './Codes/LinkDropdownCode.tsx?raw'

const LinkDropdown = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Links Dropdown</h4>
            <LinkDropDown />
          </div>
          <CodeDialog>{LinkDropDownCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default LinkDropdown
