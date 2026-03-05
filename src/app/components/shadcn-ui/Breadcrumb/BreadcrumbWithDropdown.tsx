
"use client"
import React from 'react'
import CardBox from '../../shared/CardBox'
import BreadcrumbwithDropdown from './code/BreadcrumbWithDropdownCode'
import BreadcrumbWithDropdownCode from './code/BreadcrumbWithDropdownCode.tsx?raw'
import CodeDialog from '../../ui-components/CodeDialog'



const BreadcrumbWithDropdown = () => {
    return (
        <CardBox className='p-0'>
            <div>
            <div className="p-6">
                <h4 className="text-lg font-semibold">Breadcrumb With Dropdown</h4>
                <BreadcrumbwithDropdown />
            </div>
            <CodeDialog>{BreadcrumbWithDropdownCode}</CodeDialog>
            </div>
        </CardBox>
    )
}

export default BreadcrumbWithDropdown