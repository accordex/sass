import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import Groupingpopover from './Code/GroupingPopoverCode'
import GroupingpopoverCode from './Code/GroupingPopoverCode.tsx?raw'

const GroupingPopover = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>
              Grouping Related Popover
            </h4>
            <Groupingpopover />
          </div>
          <CodeDialog>{GroupingpopoverCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default GroupingPopover
