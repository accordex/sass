import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import ProgressSizes from './Code/ProgressSizeCode'
import ProgressSizesCode from './Code/ProgressSizeCode.tsx?raw'

const ProgressSize = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Progress Bar Sizing</h4>
            <ProgressSizes />
          </div>
          <CodeDialog>{ProgressSizesCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default ProgressSize
