'use client'
import React from 'react'
import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import FormCardInfo from './code/FormCardCode'
import FormCardCode from './code/FormCardCode.tsx?raw'

const FormCard = () => {
  return (
    <>
        <CardBox className='p-0 shadow-none'>
            <div>
            <FormCardInfo/>
            <CodeDialog>{FormCardCode}</CodeDialog>
            </div>
        </CardBox>
    </>
  )
}

export default FormCard
