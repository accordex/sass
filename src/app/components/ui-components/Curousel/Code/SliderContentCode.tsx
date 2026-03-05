import { Carousel } from 'flowbite-react'

const SliderContentCode = () => {
  return (
    <div>
      <div className='h-56 sm:h-64 xl:h-60 overflow-hidden'>
        <Carousel>
          <div className='flex h-full items-center justify-center bg-lightgray text-lg font-semibold text-dark dark:bg-dark dark:text-white'>
            Slide 1
          </div>
          <div className='flex h-full items-center justify-center bg-lightgray text-lg font-semibold text-dark dark:bg-dark dark:text-white'>
            Slide 2
          </div>
          <div className='flex h-full items-center justify-center bg-lightgray text-lg font-semibold text-dark dark:bg-dark dark:text-white'>
            Slide 3
          </div>
        </Carousel>
      </div>
    </div>
  )
}

export default SliderContentCode
