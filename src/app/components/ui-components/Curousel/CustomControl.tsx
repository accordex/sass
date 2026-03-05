import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Customcontrol from './Code/CustomControlCode'
import CustomcontrolCode from './Code/CustomControlCode.tsx?raw'

const CustomControl = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Custom controls</h4>
            <Customcontrol />
          </div>
          <CodeDialog>{CustomcontrolCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default CustomControl
