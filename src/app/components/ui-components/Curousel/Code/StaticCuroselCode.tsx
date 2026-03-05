import { Carousel } from 'flowbite-react'

const StaticCuroselCode = () => {
  return (
    <div className='h-56 sm:h-64 xl:h-80 2xl:h-96 overflow-hidden'>
      <Carousel slide={false}>
        <img src='/images/blog/blog-img1.jpg' alt='...' />
        <img src='/images/blog/blog-img2.jpg' alt='...' />
        <img src='/images/blog/blog-img3.jpg' alt='...' />
        <img src='/images/blog/blog-img4.jpg' alt='...' />
        <img src='/images/blog/blog-img5.jpg' alt='...' />
      </Carousel>
    </div>
  )
}

export default StaticCuroselCode
