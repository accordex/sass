import React from 'react'
import type { Metadata } from 'next'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import DefaultCard from '@/app/components/ui-components/Card/DefaultCard'
import CTACardButton from '@/app/components/ui-components/Card/CTACardButton'
import CardWithImage from '@/app/components/ui-components/Card/CardWithImage'
import CustomImageREnder from '@/app/components/ui-components/Card/CustomImageREnder'
import HorizontalCard from '@/app/components/ui-components/Card/HorizontalCard'
import UserProfileCard from '@/app/components/ui-components/Card/UserProfileCard'
import FormCard from '@/app/components/ui-components/Card/FormCard'
import EcommerceCard from '@/app/components/ui-components/Card/EcommerceCard'
import ActionCard from '@/app/components/ui-components/Card/ActionCard'
import CardWithList from '@/app/components/ui-components/Card/CardWithList'
import PricingCard from '@/app/components/ui-components/Card/PricingCard'
import ComponentApi from '@/app/components/ui-components/ComponentApi'

export const metadata: Metadata = {
  title: 'Ui Cards',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Card',
  },
]

const allApis = [
  {
    id: '1',
    prop: 'href',
    description: 'Specifies the URL to navigate to when the card is clicked.',
    type: 'string',
    default: 'null',
  },
  {
    id: '2',
    prop: 'imgAlt',
    description:
      'Provides alternative text for the image, improving accessibility.',
    type: 'string',
    default: 'null',
  },
  {
    id: '3',
    prop: 'imgSrc',
    description:
      'Specifies the source URL of the image to be displayed in the card.',
    type: 'string',
    default: 'null',
  },
  {
    id: '4',
    prop: 'renderImage',
    description:
      'Allows custom rendering of the image component. If provided, `imgSrc` and `imgAlt` are ignored.',
    type: '() => <Image width={500} height={500} src="/images/blog/image-1.jpg" alt="image 1" />',
    default: 'null',
  },
  {
    id: '5',
    prop: 'horizontal',
    description:
      'Displays the card in a horizontal layout, placing the image beside the content.',
    type: 'boolean',
    default: 'false',
  },
]

const page = () => {
  return (
    <>
      <BreadcrumbComp title='Card' items={BCrumb} />
      <div className='grid grid-cols-12 gap-6'>
        {/* Default */}
        <div className='col-span-12'>
          <DefaultCard />
        </div>
        {/* CTA Card Button */}
        <div className='col-span-12'>
          <CTACardButton />
        </div>
        {/* Card With Image */}
        <div className='col-span-12'>
          <CardWithImage />
        </div>
        {/* Custom Image Render */}
        <div className='col-span-12'>
          <CustomImageREnder />
        </div>
        {/* Horizontal Card */}
        <div className=' col-span-12'>
          <HorizontalCard />
        </div>
        {/* User Profile Card */}
        <div className='col-span-12'>
          <UserProfileCard />
        </div>
        {/* Form Card */}
        <div className='col-span-12'>
          <FormCard />
        </div>
        {/* Card With List */}
        <div className='col-span-12'>
          <CardWithList />
        </div>
        {/* Pricing Card */}
        <div className='col-span-12'>
          <PricingCard />
        </div>
        {/* Ecommerce Card */}
        <div className='lg:col-span-6 col-span-12'>
          <EcommerceCard />
        </div>
        {/* Action Card */}
        <div className='lg:col-span-6 col-span-12'>
          <ActionCard />
        </div>
        {/* Api */}
        <div className='col-span-12'>
          <ComponentApi allApis={allApis} componentName='Card' />
        </div>
      </div>
    </>
  )
}

export default page
