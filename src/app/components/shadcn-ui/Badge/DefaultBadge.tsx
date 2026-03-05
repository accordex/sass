import React from 'react'
import CardBox from '../../shared/CardBox'
import Defaultbadge from './code/DefaultBadgeCode'
import DefaultBadgeCode from './code/DefaultBadgeCode.tsx?raw'
import CodeDialog from '../../ui-components/CodeDialog'


const DefaultBadge = () => {
    return (
        <CardBox className='p-0'>
            <div>
            <div className="p-6">
                <h4 className="text-lg font-semibold">Default Badge</h4>
                 <Defaultbadge/>
            </div>
            <CodeDialog>{DefaultBadgeCode}</CodeDialog>
            </div>
        </CardBox>
    )
}

export default DefaultBadge