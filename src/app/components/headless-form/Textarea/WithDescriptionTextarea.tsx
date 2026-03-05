import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import WithDescriptiontextarea from './Code/WithDescriptionTextareaCode'
import WithDescriptiontextareaCode from './Code/WithDescriptionTextareaCode.tsx?raw'

const WithDescriptionTextarea = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold'>Discription With Textarea</h4>
            <WithDescriptiontextarea />
          </div>
          <CodeDialog>{WithDescriptiontextareaCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default WithDescriptionTextarea
