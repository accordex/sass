'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import Basicdialog from './Code/BasicDialodCode'
import BasicdialogCode from './Code/BasicDialodCode.tsx?raw'

const BasicDialog = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Basic Dialog</h4>
            <Basicdialog />
          </div>
          <CodeDialog>{BasicdialogCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default BasicDialog
