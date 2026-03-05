import { Avatar } from 'flowbite-react'

const SizeAvatarCode = () => {
  return (
    <div>
      <div className='flex flex-wrap items-center gap-2'>
        <Avatar img='/images/profile/user-5.jpg' size='xs' />
        <Avatar img='/images/profile/user-5.jpg' size='sm' />
        <Avatar img='/images/profile/user-5.jpg' size='md' />
        <Avatar img='/images/profile/user-5.jpg' size='lg' />
      </div>
    </div>
  )
}

export default SizeAvatarCode
