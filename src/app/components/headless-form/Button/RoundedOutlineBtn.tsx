import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import RoundedOutlinedBtn from './Codes/RoundedOutlinedBtnCode'
import RoundedOutlinedBtnCode from './Codes/RoundedOutlinedBtnCode.tsx?raw'

const RoundedOutlineBtn = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>
              Rounded Outlined Buttons
            </h4>
            <RoundedOutlinedBtn />
          </div>
          <CodeDialog>{RoundedOutlinedBtnCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default RoundedOutlineBtn
