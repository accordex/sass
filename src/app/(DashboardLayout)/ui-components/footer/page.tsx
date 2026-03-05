import React from 'react'
import type { Metadata } from 'next'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import DefaultFooter from '@/app/components/ui-components/Footer/DefaultFooter'
import FooterWithLogo from '@/app/components/ui-components/Footer/FooterWithLogo'
import SocialFooter from '@/app/components/ui-components/Footer/SocialFooter'
import SitemapLinkFooter from '@/app/components/ui-components/Footer/SitemapLinkFooter'
import ComponentApi from '@/app/components/ui-components/ComponentApi'

export const metadata: Metadata = {
  title: 'Ui footer',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Footer',
  },
]

const allApis = [
  {
    id: '1',
    prop: 'href',
    description: 'URL the link should navigate to.',
    type: `'http://localhost:5173'`,
    default: '-',
  },
  {
    id: '2',
    prop: 'src',
    description: 'Image source for the brand logo.',
    type: `'https://flowbite.com/images/logo.svg'`,
    default: '-',
  },
  {
    id: '3',
    prop: 'alt',
    description: 'Alternative text for the logo image.',
    type: `'flowbite'`,
    default: '-',
  },
  {
    id: '4',
    prop: 'icon',
    description: 'React icon component (e.g., from react-icons).',
    type: `'BsFacebook' | 'BsInstagram'`,
    default: '-',
  },
  {
    id: '5',
    prop: 'by',
    description: 'Name of the entity being credited.',
    type: `'Flowbite'`,
    default: '-',
  },
  {
    id: '6',
    prop: 'year',
    description: 'Year displayed in the copyright.',
    type: '2022',
    default: 'new Date().getFullYear()',
  },
]

const page = () => {
  return (
    <>
      <BreadcrumbComp title='Footer' items={BCrumb} />
      <div className='grid grid-cols-12 gap-6'>
        {/* Default */}
        <div className='col-span-12'>
          <DefaultFooter />
        </div>
        {/* Footer With Logo */}
        <div className='col-span-12'>
          <FooterWithLogo />
        </div>
        {/* Social Footer */}
        <div className='col-span-12'>
          <SocialFooter />
        </div>
        {/* Sitemap Link Footer */}
        <div className='col-span-12'>
          <SitemapLinkFooter />
        </div>
        {/* Api */}
        <div className='col-span-12'>
          <ComponentApi allApis={allApis} componentName='Footer' />
        </div>
      </div>
    </>
  )
}

export default page
