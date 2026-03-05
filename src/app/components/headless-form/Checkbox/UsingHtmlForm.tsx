'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import UsingHtmlform from './Codes/UsingHtmlFormCode'
import UsingHtmlformCode from './Codes/UsingHtmlFormCode.tsx?raw'

const UsingHtmlForm = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>With HTML Forms</h4>
            <UsingHtmlform />
          </div>
          <CodeDialog>{UsingHtmlformCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default UsingHtmlForm
