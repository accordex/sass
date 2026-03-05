import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import Popoverwidth from './Code/PopoverWidthCode'
import PopoverwidthCode from './Code/PopoverWidthCode.tsx?raw'

const PopoverWidth = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Popover Width</h4>
            <Popoverwidth />
          </div>
          <CodeDialog>{PopoverwidthCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default PopoverWidth
