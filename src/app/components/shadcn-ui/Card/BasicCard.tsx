'use client'
import React from 'react'
import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import BasicCardInfo from './code/BasicCardCode'
import BasicCarouselCode from './code/BasicCardCode.tsx?raw'

const BasicCard = () => {
  return (
    <>
        <CardBox className='p-0 shadow-none'>
            <div>
            <BasicCardInfo/>
            <CodeDialog>{BasicCarouselCode}</CodeDialog>
            </div>
        </CardBox>
    </>
  )
}

export default BasicCard
