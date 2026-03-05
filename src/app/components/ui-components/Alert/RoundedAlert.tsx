import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Roundedalert from './Code/RoundedAlertCode'
import RoundedalertCode from './Code/RoundedAlertCode.tsx?raw'

const RoundedAlert = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Rounded Alert</h4>
            <Roundedalert />
          </div>
          <CodeDialog>{RoundedalertCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default RoundedAlert
