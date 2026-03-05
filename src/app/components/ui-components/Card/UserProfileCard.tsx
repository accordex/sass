'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import UserProfilecard from './Code/UserProfileCardCode'
import UserProfilecardCode from './Code/UserProfileCardCode.tsx?raw'

const UserProfileCard = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>User Profile Card</h4>
            <UserProfilecard />
          </div>
          <CodeDialog>{UserProfilecardCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default UserProfileCard
