import { Card } from 'flowbite-react'

const CustomImageREnderCode = () => {
  return (
    <>
      <div>
        <Card
          className='max-w-sm'
          renderImage={() => (
            <img
              width={300}
              height={200}
              src='/images/blog/blog-img2.jpg'
              alt='image 1'
            />
          )}>
          <h5 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-white pt-4'>
            Noteworthy technology acquisitions
          </h5>
          <p className='font-normal text-gray-700 dark:text-gray-400'>
            Here are the biggest enterprise technology acquisitions of 2024 so
            far, in reverse chronological order.
          </p>
        </Card>
      </div>
    </>
  )
}

export default CustomImageREnderCode
