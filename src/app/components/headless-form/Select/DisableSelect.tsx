import CardBox from '../../shared/CardBox'
import Disableselect from './Code/DisableSelectCode'
import DisableselectCode from './Code/DisableSelectCode.tsx?raw'
import CodeDialog from '../../ui-components/CodeDialog'

const DisabledSelect = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Disabeld Select</h4>
            <Disableselect />
          </div>
          <CodeDialog>{DisableselectCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default DisabledSelect
