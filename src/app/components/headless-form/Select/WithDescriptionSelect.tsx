import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import WithDescriptionselect from './Code/WithDescriptionSelectCode'
import WithDescriptionselectCode from './Code/WithDescriptionSelectCode.tsx?raw'

const WithDescriptionSelect = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>
              With Descrioption Select
            </h4>
            <WithDescriptionselect />
          </div>
          <CodeDialog>{WithDescriptionselectCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default WithDescriptionSelect
