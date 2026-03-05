import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Insidetext from './Code/InsideTextCode'
import InsidetextCode from './Code/InsideTextCode.tsx?raw'

const InsideText = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>KBD Inside Text</h4>
            <Insidetext />
          </div>
          <CodeDialog>{InsidetextCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default InsideText
