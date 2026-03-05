import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import LightRounded from './Code/LightRoundedCode'
import LightRoundedCode from './Code/LightRoundedCode.tsx?raw'

const LightRoundeAlert = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Light Rounded Alert</h4>
            <LightRounded />
          </div>
          <CodeDialog>{LightRoundedCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default LightRoundeAlert
