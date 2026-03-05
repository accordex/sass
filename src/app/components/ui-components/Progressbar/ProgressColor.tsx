import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Progresscolor from './Code/ProgressColorCode'
import ProgresscolorCode from './Code/ProgressColorCode.tsx?raw'

const ProgressColor = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Progress Bar Color</h4>
            <Progresscolor />
          </div>
          <CodeDialog>{ProgresscolorCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default ProgressColor
