import { Avatar } from 'flowbite-react'

const ColorAvatarCode = () => {
  return (
    <div>
      <div className='flex flex-col gap-5'>
        <div className='flex flex-wrap gap-2'>
          <Avatar
            img='/images/profile/user-5.jpg'
            rounded
            bordered
            color='gray'
          />
          <Avatar
            img='/images/profile/user-5.jpg'
            rounded
            bordered
            color='light'
          />
          <Avatar
            img='/images/profile/user-5.jpg'
            rounded
            bordered
            color='purple'
          />
          <Avatar
            img='/images/profile/user-5.jpg'
            rounded
            bordered
            color='success'
          />
          <Avatar
            img='/images/profile/user-5.jpg'
            rounded
            bordered
            color='pink'
          />
        </div>
        <div className='flex flex-wrap gap-2'>
          <Avatar img='/images/profile/user-5.jpg' bordered color='gray' />
          <Avatar img='/images/profile/user-5.jpg' bordered color='light' />
          <Avatar img='/images/profile/user-5.jpg' bordered color='purple' />
          <Avatar img='/images/profile/user-5.jpg' bordered color='success' />
          <Avatar img='/images/profile/user-5.jpg' bordered color='pink' />
        </div>
      </div>
    </div>
  )
}

export default ColorAvatarCode
