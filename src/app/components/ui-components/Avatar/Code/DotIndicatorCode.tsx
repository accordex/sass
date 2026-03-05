import { Avatar } from 'flowbite-react'

const DotIndicatorCode = () => {
  return (
    <div>
      <div className='flex flex-wrap gap-2'>
        <Avatar img='/images/profile/user-2.jpg' status='online' />
        <Avatar
          img='/images/profile/user-3.jpg'
          rounded
          status='busy'
          statusPosition='top-right'
        />
        <Avatar
          img='/images/profile/user-4.jpg'
          status='offline'
          statusPosition='bottom-left'
        />
        <Avatar
          img='/images/profile/user-5.jpg'
          rounded
          status='away'
          statusPosition='bottom-right'
        />
      </div>
    </div>
  )
}

export default DotIndicatorCode
