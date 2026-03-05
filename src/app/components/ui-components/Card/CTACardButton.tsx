import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import CTACardbutton from './Code/CTACardButtonCode'
import CTACardbuttonCode from './Code/CTACardButtonCode.tsx?raw'

const CTACardButton = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Card With CTA Button</h4>
            <CTACardbutton />
          </div>
          <CodeDialog>{CTACardbuttonCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default CTACardButton
