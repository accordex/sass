'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import SitemapLinkfooter from './Code/SitemapLinkFooterCode'
import SitemapLinkfooterCode from './Code/SitemapLinkFooterCode.tsx?raw'

const SitemapLinkFooter = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Sitemap links</h4>
            <SitemapLinkfooter />
          </div>
          <CodeDialog>{SitemapLinkfooterCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default SitemapLinkFooter
