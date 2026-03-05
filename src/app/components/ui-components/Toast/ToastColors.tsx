'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Toastcolors from './Code/ToastColorsCode'
import ToastcolorsCode from './Code/ToastColorsCode.tsx?raw'

const ToastColors = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Toast Colors</h4>
            <Toastcolors />
          </div>
          <CodeDialog>{ToastcolorsCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default ToastColors
