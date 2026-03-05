import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Headingstyp from './Code/HeadingsTypCode'
import HeadingstypCode from './Code/HeadingsTypCode.tsx?raw'

const HeadingsTyp = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Headings</h4>
            <Headingstyp />
          </div>
          <CodeDialog>{HeadingstypCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default HeadingsTyp
