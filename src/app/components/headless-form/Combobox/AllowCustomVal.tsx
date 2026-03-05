'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import HtmlForms from './Codes/HtmlFormsCodes'
import HtmlFormsCodes from './Codes/HtmlFormsCodes.tsx?raw'

const AllowCustomVal = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>HTML Forms</h4>
            <HtmlForms />
          </div>
          <CodeDialog>{HtmlFormsCodes}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default AllowCustomVal
