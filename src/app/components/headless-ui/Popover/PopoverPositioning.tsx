import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import PopoverPosition from './Code/PopoverPositionCode'
import PopoverPositionCode from './Code/PopoverPositionCode.tsx?raw'

const PopoverPositioning = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Popover Positioning</h4>
            <PopoverPosition />
          </div>
          <CodeDialog>{PopoverPositionCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default PopoverPositioning
