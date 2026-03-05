import React from 'react'
import type { Metadata } from 'next'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import Default from '@/app/components/ui-components/Badge/Default'
import LightBadges from '@/app/components/ui-components/Badge/LightBadges'
import LinkBadges from '@/app/components/ui-components/Badge/LinkBadges'
import BadgesWithIconText from '@/app/components/ui-components/Badge/BadgesWithIconText'
import IconBadge from '@/app/components/ui-components/Badge/IconBadge'
import BadgeSizes from '@/app/components/ui-components/Badge/BadgeSizes'
import ComponentApi from '@/app/components/ui-components/ComponentApi'

export const metadata: Metadata = {
  title: 'Ui Badge',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Badges',
  },
]

const allApis = [
  {
    id: '1',
    prop: 'color',
    description: 'Sets the color of the badge.',
    type: `"primary" | "success" | "danger" | "warning"`,
    default: `"default"`,
  },
  {
    id: '2',
    prop: 'icon',
    description: 'Adds an icon component inside the badge, usually displayed before the text.',
    type: `"HiCheck" | "HiOutlineExclamation"`,
    default: '-',
  },
  {
    id: '3',
    prop: 'size',
    description: 'Controls the size of the badge including icon and text.',
    type: `"xs" | "sm"`,
    default: `"sm"`,
  },
];

const page = () => {
  return (
    <>
      <BreadcrumbComp title='Badges' items={BCrumb} />

      <div className='grid grid-cols-12 gap-6'>
        {/* Default */}
        <div className='col-span-12'>
          <Default />
        </div>
        {/* Light */}
        <div className='col-span-12'>
          <LightBadges />
        </div>
        {/* Link */}
        <div className='col-span-12'>
          <LinkBadges />
        </div>
        {/* Icon & Text */}
        <div className='col-span-12'>
          <BadgesWithIconText />
        </div>
        {/* Icon*/}
        <div className='col-span-12'>
          <IconBadge />
        </div>
        {/* Sizes*/}
        <div className='col-span-12'>
          <BadgeSizes />
        </div>
        {/* Api */}
        <div className='col-span-12'>
          <ComponentApi allApis={allApis} componentName='Badge' />
        </div>
      </div>
    </>
  )
}

export default page
