import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import WithLabel from './Code/WithLabelCode'
import WithLabelCode from './Code/WithLabelCode.tsx?raw'

const WithLabelTextarea = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Label With Textarea</h4>
            <WithLabel />
          </div>
          <CodeDialog>{WithLabelCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default WithLabelTextarea
