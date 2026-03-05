import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import DisableButtons from './Codes/DisableButtonsCode'
import DisableButtonsCode from './Codes/DisableButtonsCode.tsx?raw'

const DisableButton = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Disable Buttons</h4>
            <DisableButtons />
          </div>
          <CodeDialog>{DisableButtonsCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default DisableButton
