import React from 'react'
import type { Metadata } from 'next'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import DefaultPagination from '@/app/components/ui-components/Pagination/DefaultPagination'
import PaginationWithIcon from '@/app/components/ui-components/Pagination/PaginationWithIcon'
import TableDataPaginationIcon from '@/app/components/ui-components/Pagination/TableDataPaginationIcon'
import PrevNextPagiantion from '@/app/components/ui-components/Pagination/PrevNextPagiantion'
import PrevNextPagiantionIcon from '@/app/components/ui-components/Pagination/PrevNextPagiantionIcon'
import PaginationControl from '@/app/components/ui-components/Pagination/PaginationControl'
import ComponentApi from '@/app/components/ui-components/ComponentApi'

export const metadata: Metadata = {
  title: 'Ui Pagination',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Pagination',
  },
]

const allApis = [
  {
    id: '1',
    prop: 'currentPage',
    description: 'The current active page.',
    type: 'number',
    default: '1',
  },
  {
    id: '2',
    prop: 'totalPages',
    description: 'The total number of pages.',
    type: 'number',
    default: '1',
  },
  {
    id: '3',
    prop: 'showIcons',
    description:
      'If `true`, next and previous buttons will be shown with icons.',
    type: 'boolean',
    default: 'false',
  },
  {
    id: '4',
    prop: 'layout',
    description: 'The layout style of the pagination.',
    type: "'pagination' | 'navigation' | 'table'",
    default: "'pagination'",
  },
  {
    id: '5',
    prop: 'previousLabel',
    description: 'Label for the previous button.',
    type: `'Previous' | 'Go back' | '<' | '‹'`,
    default: `'Previous'`,
  },
  {
    id: '6',
    prop: 'nextLabel',
    description: 'Label for the next button.',
    type: `'Next' | 'Go forward' | '>' | '›'`,
    default: `'Next'`,
  },
]

const page = () => {
  return (
    <>
      <BreadcrumbComp title='Pagination' items={BCrumb} />
      <div className='grid grid-cols-12 gap-6'>
        {/* Default */}
        <div className='col-span-12'>
          <DefaultPagination />
        </div>
        {/* With Icons */}
        <div className='col-span-12'>
          <PaginationWithIcon />
        </div>
        {/* Prev Next Pagiantion */}
        <div className='col-span-12'>
          <PrevNextPagiantion />
        </div>
        {/* Prev Next Pagiantion Icon */}
        <div className='col-span-12'>
          <PrevNextPagiantionIcon />
        </div>
        {/* Table Data PaginationIcon */}
        <div className='col-span-12'>
          <TableDataPaginationIcon />
        </div>
        {/* Table Data PaginationIcon */}
        <div className='col-span-12'>
          <PaginationControl />
        </div>
        {/* Api */}
        <div className='col-span-12'>
          <ComponentApi allApis={allApis} componentName='Pagination' />
        </div>
      </div>
    </>
  )
}

export default page
