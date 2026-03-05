import { Card } from 'flowbite-react'

const HorizontalCardCode = () => {
  return (
    <>
      <div className='grid grid-cols-12 gap-5 sm:gap-30'>
        <div className='lg:col-span-6 col-span-12'>
          <Card
            className='max-w-sm'
            imgSrc='/images/blog/blog-img3.jpg'
            horizontal>
            <h5 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-white p-4'>
              Noteworthy technology acquisitions
            </h5>
            <p className='font-normal text-gray-700 dark:text-gray-400 pl-4'>
              Here are the biggest enterprise technology acquisitions of 2024 so
              far, in reverse chronological order.
            </p>
          </Card>
        </div>
        <div className='lg:col-span-6 col-span-12'>
          <Card
            className='max-w-sm'
            imgSrc='/images/blog/blog-img4.jpg'
            horizontal>
            <h5 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-white p-4'>
              Noteworthy technology acquisitions
            </h5>
            <p className='font-normal text-gray-700 dark:text-gray-400 pl-4'>
              Here are the biggest enterprise technology acquisitions of 2024 so
              far, in reverse chronological order.
            </p>
          </Card>
        </div>
      </div>
    </>
  )
}

export default HorizontalCardCode
