import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Labelprogress from './Code/LabelProgressCode'
import LabelprogressCode from './Code/LabelProgressCode.tsx?raw'

const LabelProgress = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Label Progress Bar</h4>
            <Labelprogress />
          </div>
          <CodeDialog>{LabelprogressCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default LabelProgress
