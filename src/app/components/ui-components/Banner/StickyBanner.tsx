import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Stickybanner from './Code/StickyBannerCode'
import StickybannerCode from './Code/StickyBannerCode.tsx?raw'

const StickyBanner = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>
              Default sticky banner
            </h4>
            <Stickybanner />
          </div>
          <CodeDialog>{StickybannerCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default StickyBanner
