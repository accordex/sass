'use client'
import CardBox from '../../shared/CardBox'
import BasicAccordian from './Code/BasicAccordiancode'
import BasicAccordiancode from './Code/BasicAccordiancode.tsx?raw'
import CodeDialog from '../CodeDialog'

const basicAccordion = () => {
  return (
    <>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Accordion</h4>
            <BasicAccordian />
          </div>
          <CodeDialog>{BasicAccordiancode}</CodeDialog>
        </div>
      </CardBox>
    </>
  )
}

export default basicAccordion
