import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Pricingcard from './Code/PricingCardCode'
import PricingcardCode from './Code/PricingCardCode.tsx?raw'

const PricingCard = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Pricing Card</h4>
            <Pricingcard />
          </div>
          <CodeDialog>{PricingcardCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default PricingCard
