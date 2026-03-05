import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Coloravatar from './Code/ColorAvatarCode'
import ColoravatarCode from './Code/ColorAvatarCode.tsx?raw'

const ColorAvatar = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Colors</h4>
            <Coloravatar />
          </div>
          <CodeDialog>{ColoravatarCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default ColorAvatar
