import FullLogo from '@/app/(DashboardLayout)/layout/shared/logo/FullLogo'
import {
  Navbar,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from 'flowbite-react'
import Link from 'next/link'

const DefaultNavCode = () => {
  return (
    <>
      <div>
        <Navbar fluid className='rounded-md'>
          <FullLogo />
          <NavbarToggle />
          <NavbarCollapse className='overflow-x-auto'>
            <NavbarLink href='#' active className='text-primary'>
              Home
            </NavbarLink>
            <NavbarLink as={Link} href='#'>
              About
            </NavbarLink>
            <NavbarLink href='#'>Services</NavbarLink>
            <NavbarLink href='#'>Pricing</NavbarLink>
            <NavbarLink href='#'>Contact</NavbarLink>
          </NavbarCollapse>
        </Navbar>
      </div>
    </>
  )
}

export default DefaultNavCode
