import { Avatar } from 'flowbite-react'

const DefaultAvatarCode = () => {
  return (
    <div>
      <div className='flex flex-wrap gap-2'>
        <Avatar img='/images/profile/user-2.jpg' rounded />
        <Avatar img='/images/profile/user-3.jpg' />
      </div>
    </div>
  )
}

export default DefaultAvatarCode
