'use client'
import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import DisableComboOpt from './Codes/DisableComboOptCode'
import DisableComboOptCode from './Codes/DisableComboOptCode.tsx?raw'

const DisableComboOption = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>
              Disabled Combo Option
            </h4>
            <DisableComboOpt />
          </div>
          <CodeDialog>{DisableComboOptCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default DisableComboOption
