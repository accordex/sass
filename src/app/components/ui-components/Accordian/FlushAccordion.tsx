'use client'
import CardBox from '../../shared/CardBox'
import FlushAccordian from './Code/FlushAccordiancode'
import FlushAccordiancode from './Code/FlushAccordiancode.tsx?raw'
import CodeDialog from '../CodeDialog'

const flushAccordian = () => {
  return (
    <>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Accordian Flush</h4>
            <FlushAccordian />
          </div>
          <CodeDialog>{FlushAccordiancode}</CodeDialog>
        </div>
      </CardBox>
    </>
  )
}

export default flushAccordian
