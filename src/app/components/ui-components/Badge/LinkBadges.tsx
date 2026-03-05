import React from 'react'
import CardBox from '../../shared/CardBox'
import Linkbadge from './Code/LinkBadgeCode'
import LinkbadgeCode from './Code/LinkBadgeCode.tsx?raw'
import CodeDialog from '../CodeDialog'

const LinkBadges = () => {
  return (
    <>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Badges as link</h4>
            <Linkbadge />
          </div>
          <CodeDialog>{LinkbadgeCode}</CodeDialog>
        </div>
      </CardBox>
    </>
  )
}

export default LinkBadges
