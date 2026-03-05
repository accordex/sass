import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import FooterWithlogo from './Code/FooterWithLogoCode'
import FooterWithlogoCode from './Code/FooterWithLogoCode.tsx?raw'

const FooterWithLogo = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Footer With Logo</h4>
            <FooterWithlogo />
          </div>
          <CodeDialog>{FooterWithlogoCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default FooterWithLogo
