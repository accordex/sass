'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import LightDissmisable from './Code/LightDissmisableCode'
import LightDissmisableCode from './Code/LightDissmisableCode.tsx?raw'

const LightDismissibleAlert = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>
              Light Dismissible Alert
            </h4>
            <LightDissmisable />
          </div>
          <CodeDialog>{LightDissmisableCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default LightDismissibleAlert
