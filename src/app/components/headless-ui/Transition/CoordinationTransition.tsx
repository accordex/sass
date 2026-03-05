'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import Coordination from './Codes/CoordinationCode'
import CoordinationCode from './Codes/CoordinationCode.tsx?raw'

const CoordinationTransition = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>
              Coordinating Transition
            </h4>
            <Coordination />
          </div>
          <CodeDialog>{CoordinationCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default CoordinationTransition
