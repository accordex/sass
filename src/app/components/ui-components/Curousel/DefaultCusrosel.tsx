"use"

import { Carousel } from 'flowbite-react'
import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Defaultcurousel from './Code/DefaultCurouselCode'
import DefaultcurouselCode from './Code/DefaultCurouselCode.tsx?raw'

const DefaultCusrosel = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Default Carousel</h4>
            <Defaultcurousel />
          </div>
          <CodeDialog>{DefaultcurouselCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default DefaultCusrosel
