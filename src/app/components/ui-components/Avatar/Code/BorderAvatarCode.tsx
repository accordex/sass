import { Avatar } from 'flowbite-react'

const BorderAvatarCode = () => {
  return (
    <div>
      <div className='flex flex-wrap gap-2'>
        <Avatar img='/images/profile/user-2.jpg' rounded bordered />
        <Avatar img='/images/profile/user-3.jpg' bordered />
      </div>
    </div>
  )
}

export default BorderAvatarCode
