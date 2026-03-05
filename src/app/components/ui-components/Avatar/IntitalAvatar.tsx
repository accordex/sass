import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Intitalavatar from './Code/IntitalAvatarCode'
import IntitalavatarCode from './Code/IntitalAvatarCode.tsx?raw'

const IntitalAvatar = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Placeholder Initials</h4>
            <Intitalavatar />
          </div>
          <CodeDialog>{IntitalavatarCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default IntitalAvatar
