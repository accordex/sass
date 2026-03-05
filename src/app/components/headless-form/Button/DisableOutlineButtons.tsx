import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import DisableOutlineBtn from './Codes/DisableOutlineBtnCode'
import DisableOutlineBtnCode from './Codes/DisableOutlineBtnCode.tsx?raw'

const DisableOutlineButtons = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>
              Disable Outlined Buttons
            </h4>
            <DisableOutlineBtn />
          </div>
          <CodeDialog>{DisableOutlineBtnCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default DisableOutlineButtons
