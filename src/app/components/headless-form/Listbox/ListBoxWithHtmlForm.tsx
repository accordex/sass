'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import ListBoxWithHtml from './Codes/ListBoxWithHtmlCode'
import ListBoxWithHtmlCode from './Codes/ListBoxWithHtmlCode.tsx?raw'

const ListBoxWithHtmlForm = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Using HTML forms</h4>
            <ListBoxWithHtml />
          </div>
          <CodeDialog>{ListBoxWithHtmlCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default ListBoxWithHtmlForm
