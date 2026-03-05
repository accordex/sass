'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Formmodal from './Code/FormModalCode'
import FormmodalCode from './Code/FormModalCode.tsx?raw'

const FormModal = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>
              Modal with form elements
            </h4>
            <Formmodal />
          </div>
          <CodeDialog>{FormmodalCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default FormModal
