import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import OutlineButtongroup from './Code/OutlineButtonGroupCode'
import OutlineButtongroupCode from './Code/OutlineButtonGroupCode.tsx?raw'

const OutlineButtonGroup = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Outline button group</h4>
            <OutlineButtongroup />
          </div>
          <CodeDialog>{OutlineButtongroupCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default OutlineButtonGroup
