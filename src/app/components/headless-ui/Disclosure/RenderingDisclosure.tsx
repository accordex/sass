'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import RenderDiclosure from './Code/RenderDiclosureCode'
import RenderDiclosureCode from './Code/RenderDiclosureCode.tsx?raw'

const RenderingDisclosure = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>
              Rendering As Different Elements
            </h4>
            <RenderDiclosure />
          </div>
          <CodeDialog>{RenderDiclosureCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default RenderingDisclosure
