import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Borderavatar from './Code/BorderAvatarCode'
import BorderavatarCode from './Code/BorderAvatarCode.tsx?raw'

const BorderAvatar = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Border Avatar</h4>
            <Borderavatar />
          </div>
          <CodeDialog>{BorderavatarCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default BorderAvatar
