import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Colorspinner from './Code/ColorSpinnerCode'
import ColorspinnerCode from './Code/ColorSpinnerCode.tsx?raw'

const ColorSpinner = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Spinner colors</h4>
            <Colorspinner />
          </div>
          <CodeDialog>{ColorspinnerCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default ColorSpinner
