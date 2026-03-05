import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Horizontalcard from './Code/HorizontalCardCode'
import HorizontalcardCode from './Code/HorizontalCardCode.tsx?raw'

const HorizontalCard = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Horizontal Card</h4>
            <Horizontalcard />
          </div>
          <CodeDialog>{HorizontalcardCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default HorizontalCard
