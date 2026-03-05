"use client"
import React from 'react'
import CardBox from '../../shared/CardBox'
import BadgeWithIcon from './code/BadgeWithIconCode'
import BadgeWithIconCode from './code/BadgeWithIconCode.tsx?raw'
import CodeDialog from '../../ui-components/CodeDialog'

const BadgeWithIconText = () => {
    return (
        <CardBox className='p-0'>
            <div>
            <div className="p-6">
                <h4 className="text-lg font-semibold">Badge With Icon Text</h4>
                 <BadgeWithIcon/>
            </div>
            <CodeDialog>{BadgeWithIconCode}</CodeDialog>
            </div>
        </CardBox>
    )
}

export default BadgeWithIconText