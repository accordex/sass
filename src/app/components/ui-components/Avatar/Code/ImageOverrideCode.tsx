import { Avatar } from 'flowbite-react'
import Image from 'next/image'

const ImageOverrideCode = () => {
  return (
    <div>
      <div className='flex flex-wrap gap-2'>
        <Avatar
          img={(props) => (
            <Image
              alt=''
              height='48'
              referrerPolicy='no-referrer'
              src='/images/profile/user-2.jpg'
              width='48'
              {...props}
            />
          )}
        />
        <Avatar
          img={(props) => (
            <picture>
              <source
                media='(min-width: 900px)'
                srcSet='/images/profile/user-2.jpg'
              />
              <source
                media='(min-width: 480px)'
                srcSet='/images/profile/user-1.jpg'
              />
              <Image
                alt=''
                height='48'
                src='/images/profile/user-1.jpg'
                width='48'
                {...props}
              />
            </picture>
          )}
        />
      </div>
    </div>
  )
}

export default ImageOverrideCode
