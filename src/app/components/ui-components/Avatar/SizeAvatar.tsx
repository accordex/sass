import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Sizeavatar from './Code/SizeAvatarCode'
import SizeavatarCode from './Code/SizeAvatarCode.tsx?raw'

const SizeAvatar = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Avatar Sizes</h4>
            <Sizeavatar />
          </div>
          <CodeDialog>{SizeavatarCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default SizeAvatar
