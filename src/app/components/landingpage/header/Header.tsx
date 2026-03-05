"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import "flowbite";
import {Navbar, NavbarCollapse, NavbarLink } from "flowbite-react";
import FullLogo from "@/app/(DashboardLayout)/layout/shared/logo/FullLogo";
import PagesMenu from "./Pagesmenu";
import DemosMenu from "./DemosMenu";
import MobileDrawer from "./MobileDrawer";
import FrontPageMenu from "./FrontPageMenu";

const Header = () => {
  const [isSticky, setIsSticky] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 ${
          isSticky
            ? "bg-white dark:bg-dark shadow-md "
            : "bg-white dark:bg-dark"
        }`}
      >
        <Navbar className="fluid py-6">
          <FullLogo />
          <MobileDrawer/>
          <NavbarCollapse className="xl:block hidden">
            <DemosMenu />
            <FrontPageMenu/>
            <PagesMenu />
            <NavbarLink as={Link} href="https://adminmart.github.io/premium-documentation/nextjs/matdash/index.html" className="rounded-md me-0 hover:!text-primary">
              Documentation
            </NavbarLink>
            <NavbarLink as={Link} href="" className="rounded-md me-0 hover:!text-primary">
              Support
            </NavbarLink>
            <NavbarLink
              as={Link}
              href="/auth/auth2/login"
              className="bg-primary cursor-pointer text-white text-sm hover:!text-white dark:hover:text-white hover:!bg-primaryemphasis !py-2 !px-5 rounded-md"
            >
              Login
            </NavbarLink>
          </NavbarCollapse>
        </Navbar>
      </header>
    </>
  );
};

export default Header;
