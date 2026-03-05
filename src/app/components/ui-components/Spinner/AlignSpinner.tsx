import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Alignspinner from './Code/AlignSpinnerCode'
import AlignspinnerCode from './Code/AlignSpinnerCode.tsx?raw'

const AlignSpinner = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Alignment</h4>
            <Alignspinner />
          </div>
          <CodeDialog>{AlignspinnerCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default AlignSpinner
