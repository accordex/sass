import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Sizingspinner from './Code/SizingSpinnerCode'
import SizingspinnerCode from './Code/SizingSpinnerCode.tsx?raw'

const SizingSpinner = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Sizing Options</h4>
            <Sizingspinner />
          </div>
          <CodeDialog>{SizingspinnerCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default SizingSpinner
