'use client'
import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import BasicList from './Codes/BasicListCode'
import BasicListCode from './Codes/BasicListCode.tsx?raw'

const BasicListbox = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Basic Listbox</h4>
            <BasicList />
          </div>
          <CodeDialog>{BasicListCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default BasicListbox
