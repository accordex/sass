import { AvatarGroup, Avatar } from 'flowbite-react'

const StackLayoutCode = () => {
  return (
    <div>
      <div className='flex flex-col flex-wrap gap-5'>
        <AvatarGroup>
          <Avatar img='/images/profile/user-2.jpg' rounded stacked />
          <Avatar img='/images/profile/user-3.jpg' rounded stacked />
          <Avatar img='/images/profile/user-4.jpg' rounded stacked />
          <Avatar img='/images/profile/user-5.jpg' rounded stacked />
          <Avatar img='/images/profile/user-6.jpg' rounded stacked />
        </AvatarGroup>
        <AvatarGroup>
          <Avatar img='/images/profile/user-2.jpg' rounded stacked />
          <Avatar img='/images/profile/user-3.jpg' rounded stacked />
          <Avatar img='/images/profile/user-4.jpg' rounded stacked />
          <Avatar img='/images/profile/user-5.jpg' rounded stacked />
        </AvatarGroup>
      </div>
    </div>
  )
}

export default StackLayoutCode
