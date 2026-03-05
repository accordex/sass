import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import AvatarWithtext from './Code/AvatarWithTextCode'
import AvatarWithtextCode from './Code/AvatarWithTextCode.tsx?raw'

const AvatarWithText = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Avatar With Text</h4>
            <AvatarWithtext />
          </div>
          <CodeDialog>{AvatarWithtextCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default AvatarWithText
