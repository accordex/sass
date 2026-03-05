import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import Roundinputs from './Codes/RoundedInputs'
import RoundinputsCode from './Codes/RoundedInputs.tsx?raw'

const RoundedInputs = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Rounded Inputs form</h4>
            <Roundinputs />
          </div>
          <CodeDialog>{RoundinputsCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default RoundedInputs
