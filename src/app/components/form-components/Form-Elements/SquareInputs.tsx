import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import Squareinputs from './Codes/SquareInputs'
import SquareinputsCodes from './Codes/SquareInputs.tsx?raw'

const SquareInputs = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Square Inputs form</h4>
            <Squareinputs />
          </div>
          <CodeDialog>{SquareinputsCodes}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default SquareInputs
