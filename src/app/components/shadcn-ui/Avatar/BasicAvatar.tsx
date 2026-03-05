
"use client"
import React from 'react'
import CardBox from '../../shared/CardBox'
import Basicavatar from './code/BasicAvatarCode'
import BasicAvatarCode from './code/BasicAvatarCode.tsx?raw'
import CodeDialog from '../../ui-components/CodeDialog'

const BasicAvatar = () => {
    return (
        <CardBox className='p-0'>
            <div>
            <div className="p-6">
                <h4 className="text-lg font-semibold">Avatar</h4>
              <Basicavatar/>
            </div>
            <CodeDialog>{BasicAvatarCode}</CodeDialog>
            </div>
        </CardBox>
    )
}

export default BasicAvatar