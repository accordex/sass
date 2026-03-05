import React from 'react'
import type { Metadata } from 'next'
import BreadcrumbComp from '../../layout/shared/breadcrumb/BreadcrumbComp'
import DefaultAvatar from '@/app/components/ui-components/Avatar/DefaultAvatar'
import BorderAvatar from '@/app/components/ui-components/Avatar/BorderAvatar'
import PlaceholderAvatar from '@/app/components/ui-components/Avatar/PlaceholderAvatar'
import IntitalAvatar from '@/app/components/ui-components/Avatar/IntitalAvatar'
import DotIndicator from '@/app/components/ui-components/Avatar/DotIndicator'
import ImageOverride from '@/app/components/ui-components/Avatar/ImageOverride'
import AvatarWithText from '@/app/components/ui-components/Avatar/AvatarWithText'
import ColorAvatar from '@/app/components/ui-components/Avatar/ColorAvatar'
import StackAvatar from '@/app/components/ui-components/Avatar/StackAvatar'
import SizeAvatar from '@/app/components/ui-components/Avatar/SizeAvatar'
import ComponentApi from '@/app/components/ui-components/ComponentApi'

export const metadata: Metadata = {
  title: 'Ui Avatar',
}

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Avatar',
  },
]

const allApis = [
  {
    id: '1',
    prop: 'img',
    description: 'Specifies the image URL for the avatar.',
    type: 'string',
    default: '-',
  },
  {
    id: '2',
    prop: 'alt',
    description:
      'Provides alternative text for the avatar image, enhancing accessibility.',
    type: 'string',
    default: '-',
  },
  {
    id: '3',
    prop: 'rounded',
    description: 'Applies rounded corners to the avatar.',
    type: 'boolean',
    default: 'false',
  },
  {
    id: '4',
    prop: 'bordered',
    description: 'Adds a border around the avatar.',
    type: 'boolean',
    default: 'false',
  },
  {
    id: '5',
    prop: 'color',
    description:
      'Sets the background color of the avatar when no image is provided.',
    type: `'gray' | 'light' | 'purple' | 'success' | 'pink'`,
    default: 'gray',
  },
  {
    id: '6',
    prop: 'placeholderInitials',
    description: 'To show the user initials.',
    type: 'string',
    default: '-',
  },
  {
    id: '7',
    prop: 'status',
    description: 'Displays a status indicator on the avatar.',
    type: `'online' | 'offline' | 'away' | 'busy'`,
    default: '-',
  },
  {
    id: '8',
    prop: 'stacked',
    description: 'Stacks multiple avatars by overlapping them.',
    type: 'boolean',
    default: 'false',
  },
  {
    id: '9',
    prop: 'size',
    description: 'Sets the size of the avatar.',
    type: `'xs' | 'sm' | 'md' | 'lg' | 'xl'`,
    default: 'md',
  },
]

const page = () => {
  return (
    <>
      <BreadcrumbComp title='Avatar' items={BCrumb} />
      <div className='grid grid-cols-12 gap-6'>
        {/* Default */}
        <div className='col-span-12'>
          <DefaultAvatar />
        </div>
        {/* Border Avatar */}
        <div className='col-span-12'>
          <BorderAvatar />
        </div>
        {/* Placeholder Avatar */}
        <div className='col-span-12'>
          <PlaceholderAvatar />
        </div>
        {/* Intital Avatar */}
        <div className='col-span-12'>
          <IntitalAvatar />
        </div>
        {/* Dot Avatar */}
        <div className='col-span-12'>
          <DotIndicator />
        </div>
        {/* Image Override */}
        <div className='col-span-12'>
          <ImageOverride />
        </div>
        {/* Avatar With Text */}
        <div className='col-span-12'>
          <AvatarWithText />
        </div>
        {/* Color Avatar */}
        <div className='col-span-12'>
          <ColorAvatar />
        </div>
        {/* Stack Avatar */}
        <div className='col-span-12'>
          <StackAvatar />
        </div>
        {/* Size Avatar */}
        <div className='col-span-12'>
          <SizeAvatar />
        </div>
        {/* Api */}
        <div className='col-span-12'>
          <ComponentApi allApis={allApis} componentName='Avatar' />
        </div>
      </div>
    </>
  )
}

export default page
