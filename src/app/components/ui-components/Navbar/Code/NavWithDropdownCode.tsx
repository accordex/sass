import FullLogo from '@/app/(DashboardLayout)/layout/shared/logo/FullLogo'
import {
  Navbar,
  Dropdown,
  Avatar,
  DropdownHeader,
  DropdownItem,
  DropdownDivider,
  NavbarToggle,
  NavbarCollapse,
  NavbarLink,
} from 'flowbite-react'

const NavWithDropdownCode = () => {
  return (
    <>
      <div>
        <Navbar fluid className='rounded-md'>
          <FullLogo />
          <div className='flex md:order-2'>
            <Dropdown
              arrowIcon={false}
              inline
              label={
                <Avatar
                  alt='User settings'
                  img='/images/profile/user-2.jpg'
                  rounded
                />
              }>
              <DropdownHeader>
                <span className='block text-sm'>Bonnie Green</span>
                <span className='block truncate text-sm font-medium'>
                  info@Materialm.com
                </span>
              </DropdownHeader>
              <DropdownItem>Dashboard</DropdownItem>
              <DropdownItem>Settings</DropdownItem>
              <DropdownItem>Earnings</DropdownItem>
              <DropdownDivider />
              <DropdownItem>Sign out</DropdownItem>
            </Dropdown>
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

export default NavWithDropdownCode
