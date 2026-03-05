
"use client"
import React from 'react'
import CardBox from '../../shared/CardBox'
import Outlinebutton from './code/OutlineButtonCode'
import OutlineButtonCode from './code/OutlineButtonCode.tsx?raw'
import CodeDialog from '../../ui-components/CodeDialog'



const OutlineButton = () => {
    return (
        <CardBox className='p-0'>
            <div>
            <div className="p-6">
                <h4 className="text-lg font-semibold">Outline Button</h4>
                 <Outlinebutton/>
            </div>
            <CodeDialog>{OutlineButtonCode}</CodeDialog>
            </div>
        </CardBox>
    )
}

export default OutlineButton