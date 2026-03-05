'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Formdrawer from './Code/FormDrawerCode'
import FormdrawerCode from './Code/FormDrawerCode.tsx?raw'

const FormDrawer = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Form Drawer</h4>
            <Formdrawer />
          </div>
          <CodeDialog>{FormdrawerCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default FormDrawer
