'use client'
import React from 'react'
import CardBox from '../../shared/CardBox'
import DropDownheader from './Code/DropDownHeaderCode'
import DropDownheaderCode from './Code/DropDownHeaderCode.tsx?raw'
import CodeDialog from '../CodeDialog'

const DropDownHeader = () => {
  return (
    <>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Dropdown Header</h4>
            <DropDownheader />
          </div>
          <CodeDialog>{DropDownheaderCode}</CodeDialog>
        </div>
      </CardBox>
    </>
  )
}

export default DropDownHeader
