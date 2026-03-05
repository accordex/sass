import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import Lightbuttons from './Codes/LightButtonsCode'
import LightbuttonsCode from './Codes/LightButtonsCode.tsx?raw'

const LightButtons = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Light Buttons</h4>
            <Lightbuttons />
          </div>
          <CodeDialog>{LightbuttonsCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default LightButtons
