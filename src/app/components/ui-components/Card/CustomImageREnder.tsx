'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import CustomImageRender from './Code/CustomImageREnderCode'
import CustomImageRenderCode from './Code/CustomImageREnderCode.tsx?raw'

const CustomImageREnder = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>
              Image Render Function
            </h4>
            <CustomImageRender />
          </div>
          <CodeDialog>{CustomImageRenderCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default CustomImageREnder
