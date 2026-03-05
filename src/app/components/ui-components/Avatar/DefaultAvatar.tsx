import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Defaultavatar from './Code/DefaultAvatarCode'
import DefaultavatarCode from './Code/DefaultAvatarCode.tsx?raw'

const DefaultAvatar = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Default Avatar</h4>
            <Defaultavatar />
          </div>
          <CodeDialog>{DefaultavatarCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default DefaultAvatar
