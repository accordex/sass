'use client'

import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Localizationdatep from './Code/LocalizationDatepCode'
import LocalizationdatepCode from './Code/LocalizationDatepCode.tsx?raw'

const LocalizationDatep = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Localization</h4>
            <Localizationdatep />
          </div>
          <CodeDialog>{LocalizationdatepCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default LocalizationDatep
