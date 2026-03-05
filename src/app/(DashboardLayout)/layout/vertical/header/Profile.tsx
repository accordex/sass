"use client";

// ==============================================================================
// Profile Dropdown — Connected to NextAuth Session
// ==============================================================================
// Displays the logged-in user's name, email, and role.
// Includes navigation links and a real logout button.
// ==============================================================================

import { Icon } from "@iconify/react";
import { Badge, Dropdown, DropdownItem } from "flowbite-react";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import SimpleBar from "simplebar-react";
import { useSession, signOut } from "next-auth/react";

const Profile = () => {
  const { data: session } = useSession();

  // Extract user info from session (with fallbacks for loading state)
  const firstName = (session as any)?.firstName || "User";
  const lastName = (session as any)?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const email = session?.user?.email || "";
  const avatarUrl = session?.user?.image || "/images/profile/user-1.jpg";
  const roles = (session as any)?.roles || [];

  // Determine display badge based on primary role
  const getRoleBadge = () => {
    if (roles.includes("super_admin")) return { text: "Super Admin", color: "failure" };
    if (roles.includes("tenant_admin")) return { text: "Admin", color: "success" };
    if (roles.includes("manager")) return { text: "Manager", color: "warning" };
    return null;
  };

  const roleBadge = getRoleBadge();

  // Profile dropdown menu items
  const profileMenuItems = [
    {
      title: "My Profile",
      url: "/apps/user-profile/profile",
    },
    {
      title: "Account Settings",
      url: "/theme-pages/account-settings",
    },
  ];

  // Handle logout
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/auth1/login" });
  };

  return (
    <div className="relative ">
      <Dropdown
        label=""
        className="w-screen sm:w-[360px] pb-4 rounded-sm"
        dismissOnClick={false}
        renderTrigger={() => (
          <div className="flex items-center gap-1">
            <span className="h-10 w-10 hover:text-primary rounded-full flex justify-center items-center cursor-pointer group-hover/menu:bg-lightprimary group-hover/menu:text-primary">
              <Image
                src={avatarUrl}
                alt={fullName}
                height="35"
                width="35"
                className="rounded-full"
              />
            </span>
            <Icon
              icon="solar:alt-arrow-down-bold"
              className="hover:text-primary dark:text-primary group-hover/menu:text-primary"
              height={12}
            />
          </div>
        )}
      >
        <div className="px-6">
          {/* User info section */}
          <div className="flex items-center gap-6 pb-5 border-b border-border dark:border-darkborder mt-5 mb-3">
            <Image
              src={avatarUrl}
              alt={fullName}
              height="56"
              width="56"
              className="rounded-full"
            />
            <div>
              <h5 className="text-15 font-semibold">
                {fullName}{" "}
                {roleBadge && (
                  <span className={`text-xs text-${roleBadge.color}`}>
                    {roleBadge.text}
                  </span>
                )}
              </h5>
              <p className="text-sm text-ld opacity-80">{email}</p>
              {(session as any)?.tenantName && (
                <p className="text-xs text-ld opacity-60 mt-1">
                  {(session as any).tenantName}
                </p>
              )}
            </div>
          </div>
        </div>

        <SimpleBar>
          {/* Menu items */}
          {profileMenuItems.map((item, index) => (
            <div key={index} className="px-6 mb-2">
              <DropdownItem
                as={Link}
                href={item.url}
                className="px-3 py-2 flex justify-between items-center bg-hover group/link w-full rounded-md"
              >
                <div className="flex items-center w-full">
                  <div className="flex gap-3 w-full">
                    <h5 className="text-15 font-normal group-hover/link:text-primary">
                      {item.title}
                    </h5>
                  </div>
                </div>
              </DropdownItem>
            </div>
          ))}

          {/* Logout button */}
          <div className="px-6 mb-2">
            <DropdownItem
              onClick={handleLogout}
              className="px-3 py-2 flex justify-between items-center bg-hover group/link w-full rounded-md cursor-pointer"
            >
              <div className="flex items-center w-full">
                <div className="flex gap-3 w-full">
                  <h5 className="text-15 font-normal text-red-500 group-hover/link:text-red-600">
                    Sign Out
                  </h5>
                </div>
              </div>
            </DropdownItem>
          </div>
        </SimpleBar>
      </Dropdown>
    </div>
  );
};

export default Profile;
