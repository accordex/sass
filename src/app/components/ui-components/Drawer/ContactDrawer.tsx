'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Contactdrawer from './Code/ContactDrawerCode'
import ContactdrawerCode from './Code/ContactDrawerCode.tsx?raw'

const ContactDrawer = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Contact Form</h4>
            <Contactdrawer />
          </div>
          <CodeDialog>{ContactdrawerCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default ContactDrawer
