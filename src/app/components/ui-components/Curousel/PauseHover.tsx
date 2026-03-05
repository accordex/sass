import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Pausehover from './Code/PauseHoverCode'
import PausehoverCode from './Code/PauseHoverCode.tsx?raw'

const PauseHover = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Pause On Hover</h4>
            <Pausehover />
          </div>
          <CodeDialog>{PausehoverCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default PauseHover
