import CardBox from '../../shared/CardBox'
import CodeDialog from '../../ui-components/CodeDialog'
import InputWithdescription from './Codes/InputWithDescriptionCode'
import InputWithdescriptionCode from './Codes/InputWithDescriptionCode.tsx?raw'

const InputWithDescription = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>
              Input With Description
            </h4>
            <InputWithdescription />
          </div>
          <CodeDialog>{InputWithdescriptionCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default InputWithDescription
