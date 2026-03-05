import CardBox from '@/app/components/shared/CardBox'
import Tooltipstyle from '@/app/components/ui-components/Tooltip/Code/TooltipStyleCode'
import TooltipstyleCode from '@/app/components/ui-components/Tooltip/Code/TooltipStyleCode.tsx?raw'
import CodeDialog from '../CodeDialog'

const TooltipStyle = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Tooltip Styles</h4>
            <Tooltipstyle />
          </div>
          <CodeDialog>{TooltipstyleCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default TooltipStyle
