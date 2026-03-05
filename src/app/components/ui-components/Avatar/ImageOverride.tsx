'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Imageoverride from './Code/ImageOverrideCode'
import ImageoverrideCode from './Code/ImageOverrideCode.tsx?raw'

const ImageOverride = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Override Image</h4>
            <Imageoverride />
          </div>
          <CodeDialog>{ImageoverrideCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default ImageOverride
