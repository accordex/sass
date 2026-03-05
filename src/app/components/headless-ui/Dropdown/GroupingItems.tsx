'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import GroupItem from './Codes/GroupItemCode'
import GroupItemCode from './Codes/GroupItemCode.tsx?raw'

const GroupingItems = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Grouping Items</h4>
            <GroupItem />
          </div>
          <CodeDialog>{GroupItemCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default GroupingItems
