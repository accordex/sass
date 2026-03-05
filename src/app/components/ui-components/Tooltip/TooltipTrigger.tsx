import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Tooltiptrigger from './Code/TooltipTriggerCode'
import TooltiptriggerCode from './Code/TooltipTriggerCode.tsx?raw'

const TooltipTrigger = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Trigger Type</h4>
            <Tooltiptrigger />
          </div>
          <CodeDialog>{TooltiptriggerCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default TooltipTrigger
