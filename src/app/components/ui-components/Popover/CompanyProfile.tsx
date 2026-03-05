import CardBox from '../../shared/CardBox'
import CodeDialog from '../CodeDialog'
import Companyprofile from './Code/CompanyProfileCode'
import CompanyprofileCode from './Code/CompanyProfileCode.tsx?raw'

const CompanyProfile = () => {
  return (
    <div>
      <CardBox className='p-0'>
        <div>
          <div className='p-6'>
            <h4 className='text-lg font-semibold mb-4'>Company Profile</h4>
            <Companyprofile />
          </div>
          <CodeDialog>{CompanyprofileCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  )
}

export default CompanyProfile
