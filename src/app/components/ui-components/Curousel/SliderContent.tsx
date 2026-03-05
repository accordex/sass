import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Slidercontent from './Code/SliderContentCode'
import SlidercontentCode from './Code/SliderContentCode.tsx?raw'

const SliderContent = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Slider Content</h4>
            <Slidercontent />
          </div>
          <CodeDialog>{SlidercontentCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default SliderContent
