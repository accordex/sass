'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import Scrollabledialog from './Code/ScrollableDialogCode'
import ScrollabledialogCode from './Code/ScrollableDialogCode.tsx?raw'

const ScrollableDialog = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Scrollable Dialog</h4>
            <Scrollabledialog />
          </div>
          <CodeDialog>{ScrollabledialogCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default ScrollableDialog
