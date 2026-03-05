'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import WithTransition from './Codes/WithTransitionCode'
import WithTransitionCode from './Codes/WithTransitionCode.tsx?raw'

const WithTransitionsSwitch = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Adding Transitions</h4>
            <WithTransition />
          </div>
          <CodeDialog>{WithTransitionCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default WithTransitionsSwitch
