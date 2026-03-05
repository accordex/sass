'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import BasicSwitch from './Codes/BasicSwitchCode'
import BasicSwitchCode from './Codes/BasicSwitchCode.tsx?raw'

const BasicSwitches = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Basic Switches</h4>
            <BasicSwitch />
          </div>
          <CodeDialog>{BasicSwitchCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default BasicSwitches
