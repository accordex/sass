import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import InputWithLbl from './Codes/InputWithLblCode'
import InputWithLblCode from './Codes/InputWithLblCode.tsx?raw'

const InputWithLabel = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div className='p-6'>
          <h4 className='text-lg font-semibold mb-4'>Input With Label</h4>
          <InputWithLbl />
        </div>
        <CodeDialog>{InputWithLblCode}</CodeDialog>
      </CardBox>
    </div>
  )
}

export default InputWithLabel
