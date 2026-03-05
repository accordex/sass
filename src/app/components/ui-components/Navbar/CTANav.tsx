'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import CTAnav from './Code/CTANavCode'
import CTAnavCode from './Code/CTANavCode.tsx?raw'

const CTANav = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>
              Navbar With CTA Button
            </h4>
            <CTAnav />
          </div>
          <CodeDialog>{CTAnavCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default CTANav
