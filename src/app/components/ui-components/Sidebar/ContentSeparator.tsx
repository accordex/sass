'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Contentseparator from './Code/ContentSeparatorCode'
import ContentseparatorCode from './Code/ContentSeparatorCode.tsx?raw'

const ContentSeparator = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Content Separator</h4>
            <Contentseparator />
          </div>
          <CodeDialog>{ContentseparatorCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default ContentSeparator
