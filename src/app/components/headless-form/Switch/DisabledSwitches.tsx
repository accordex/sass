'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import DisableSwitch from './Codes/DisableSwitchesCode'
import DisableSwitchCode from './Codes/DisableSwitchesCode.tsx?raw'

const DisabledSwitches = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Disabled Switches</h4>
            <DisableSwitch />
          </div>
          <CodeDialog>{DisableSwitchCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default DisabledSwitches
