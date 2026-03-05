
"use client"
import React from 'react'
import CardBox from '../../shared/CardBox'
import DialogWithCustomClose from './code/DialogWithCustomCloseCode'
import DialogWithCustomCloseCode from './code/DialogWithCustomCloseCode.tsx?raw'
import CodeDialog from '../../ui-components/CodeDialog'


const DialogWithCustomCloseButton = () => {
    return (
        <CardBox className='p-0'>
            <div>
            <div className="p-6">
                <h4 className="text-lg font-semibold">Dialog With Custom Close</h4>
                <DialogWithCustomClose/>
            </div>
            <CodeDialog>{DialogWithCustomCloseCode}</CodeDialog>
            </div>
        </CardBox>
    )
}

export default DialogWithCustomCloseButton