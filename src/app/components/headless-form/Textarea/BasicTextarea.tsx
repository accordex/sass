import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import Basictextarea from './Code/BasicTextareaCode'
import BasictextareaCode from './Code/BasicTextareaCode.tsx?raw'

const BasicTextarea = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Basic Textarea</h4>
            <Basictextarea />
          </div>
          <CodeDialog>{BasictextareaCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default BasicTextarea
