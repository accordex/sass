import {
  MegaMenu,
  Button,
  NavbarToggle,
  NavbarCollapse,
  NavbarLink,
  MegaMenuDropdown,
} from 'flowbite-react'
import FullLogo from '@/app/(DashboardLayout)/layout/shared/logo/FullLogo'

const DefaultMegamenuCode = () => {
  return (
    <div>
      <MegaMenu className='rounded-md'>
        <div className='mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4 md:space-x-8'>
          <FullLogo />
          <div className='order-2 hidden items-center md:flex'>
            <a
              href='#'
              className='mr-1 rounded-lg px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-800 md:mr-2 md:px-5 md:py-2.5'>
              Login
            </a>
            <Button href='#' color='primary'>
              Sign up
            </Button>
          </div>
          <NavbarToggle />
          <NavbarCollapse>
            <NavbarLink href='#'>Home</NavbarLink>
            <NavbarLink>
              <MegaMenuDropdown toggle={<>Company</>}>
                <ul className='grid grid-cols-3'>
                  <div className='space-y-4 p-4'>
                    <li>
                      <a
                        href='#'
                        className='hover:text-primary-600 dark:hover:text-primary-500'>
                        About Us
                      </a>
                    </li>
                    <li>
                      <a
                        href='#'
                        className='hover:text-primary-600 dark:hover:text-primary-500'>
                        Library
                      </a>
                    </li>
                    <li>
                      <a
                        href='#'
                        className='hover:text-primary-600 dark:hover:text-primary-500'>
                        Resources
                      </a>
                    </li>
                    <li>
                      <a
                        href='#'
                        className='hover:text-primary-600 dark:hover:text-primary-500'>
                        Pro Version
                      </a>
                    </li>
                  </div>
                  <div className='space-y-4 p-4'>
                    <li>
                      <a
                        href='#'
                        className='hover:text-primary-600 dark:hover:text-primary-500'>
                        Contact Us
                      </a>
                    </li>
                    <li>
                      <a
                        href='#'
                        className='hover:text-primary-600 dark:hover:text-primary-500'>
                        Support Center
                      </a>
                    </li>
                    <li>
                      <a
                        href='#'
                        className='hover:text-primary-600 dark:hover:text-primary-500'>
                        Terms
                      </a>
                    </li>
                    <li>
                      <a
                        href='#'
                        className='hover:text-primary-600 dark:hover:text-primary-500'>
                        Blog
                      </a>
                    </li>
                  </div>
                  <div className='space-y-4 p-4'>
                    <li>
                      <a
                        href='#'
                        className='hover:text-primary-600 dark:hover:text-primary-500'>
                        Newsletter
                      </a>
                    </li>
                    <li>
                      <a
                        href='#'
                        className='hover:text-primary-600 dark:hover:text-primary-500'>
                        Playground
                      </a>
                    </li>
                    <li>
                      <a
                        href='#'
                        className='hover:text-primary-600 dark:hover:text-primary-500'>
                        License
                      </a>
                    </li>
                  </div>
                </ul>
              </MegaMenuDropdown>
            </NavbarLink>
            <NavbarLink href='#'>Team</NavbarLink>
            <NavbarLink href='#'>Contact</NavbarLink>
          </NavbarCollapse>
        </div>
      </MegaMenu>
    </div>
  )
}

export default DefaultMegamenuCode
