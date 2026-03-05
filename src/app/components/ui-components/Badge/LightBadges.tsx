import CardBox from '../../shared/CardBox'
import Lightbadge from './Code/LightBadgeCode'
import LightbadgeCode from './Code/LightBadgeCode.tsx?raw'
import CodeDialog from '../CodeDialog'

const LightBadges = () => {
  return (
    <>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Light Badges</h4>
            <Lightbadge />
          </div>
          <CodeDialog>{LightbadgeCode}</CodeDialog>
        </div>
      </CardBox>
    </>
  )
}

export default LightBadges
