import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import PopoverBgDrop from './Code/PopoverBgDropcode'
import PopoverBgDropCode from './Code/PopoverBgDropcode.tsx?raw'

const PopoverBackdrops = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Popover Backdrop</h4>
            <PopoverBgDrop />
          </div>
          <CodeDialog>{PopoverBgDropCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default PopoverBackdrops
