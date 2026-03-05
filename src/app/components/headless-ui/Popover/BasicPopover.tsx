import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import Basicpopover from './Code/BasicPopoverCode'
import BasicpopoverCode from './Code/BasicPopoverCode.tsx?raw'

const BasicPopover = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Basic Popover</h4>
            <Basicpopover />
          </div>
          <CodeDialog>{BasicpopoverCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default BasicPopover
