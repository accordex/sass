import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Dotindicator from './Code/DotIndicatorCode'
import DotindicatorCode from './Code/DotIndicatorCode.tsx?raw'

const DotIndicator = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Dot indicator</h4>
            <Dotindicator />
          </div>
          <CodeDialog>{DotindicatorCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default DotIndicator
