import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import LightBorderaccent from './Code/LightBorderAcccentCode'
import LightBorderaccentCode from './Code/LightBorderAcccentCode.tsx?raw'

const LightBorderAccent = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Light Border Accent</h4>
            <LightBorderaccent />
          </div>
          <CodeDialog>{LightBorderaccentCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default LightBorderAccent
