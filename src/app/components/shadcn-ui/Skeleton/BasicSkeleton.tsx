
"use client"
import React from 'react'
import CardBox from '../../shared/CardBox'
import Basicskeleton from './code/BasicSkeletonCode'
import BasicSkeletonCode from './code/BasicSkeletonCode.tsx?raw'
import CodeDialog from '../../ui-components/CodeDialog'




const BasicSkeleton = () => {
    return (
        <CardBox className='p-0'>
            <div>
            <div className="p-6">
                <h4 className="text-lg font-semibold">Basic Skeleton</h4>
                <Basicskeleton/>
            </div>
            <CodeDialog>{BasicSkeletonCode}</CodeDialog>
            </div>
        </CardBox>
    )
}

export default BasicSkeleton