import FullLogo from '@/app/(DashboardLayout)/layout/shared/logo/FullLogo'
import {
  Navbar,
  Button,
  NavbarToggle,
  NavbarCollapse,
  NavbarLink,
} from 'flowbite-react'

const CTANavCode = () => {
  return (
    <>
      <div>
        <Navbar fluid className='rounded-md'>
          <FullLogo />
          <div className='flex md:order-2'>
            <Button color='primary' className='me-1'>
              Get started
            </Button>
            <NavbarToggle />
          </div>
          <NavbarCollapse className='overflow-x-auto'>
            <NavbarLink href='#' active className='text-primary'>
              Home
            </NavbarLink>
            <NavbarLink href='#'>About</NavbarLink>
            <NavbarLink href='#'>Services</NavbarLink>
            <NavbarLink href='#'>Pricing</NavbarLink>
            <NavbarLink href='#'>Contact</NavbarLink>
          </NavbarCollapse>
        </Navbar>
      </div>
    </>
  )
}

export default CTANavCode
