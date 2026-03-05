"use client";
import React, { useState } from "react";
import CardBox from "../../shared/CardBox";
import { Badge, Select, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { Icon } from "@iconify/react";

import product1 from "/public/images/products/dash-prd-1.jpg";
import product2 from "/public/images/products/dash-prd-2.jpg";
import product3 from "/public/images/products/dash-prd-3.jpg";
import product4 from "/public/images/products/dash-prd-4.jpg";

import Image from "next/image";
import SimpleBar from "simplebar-react";

const RevenueByProduct = () => {
  const dropdownItems = ["Sep 2024", "Oct 2024", "Nov 2024"];
  // Custom Tab
  const [activeTab, setActiveTab] = useState("App");
  const handleTabClick = (tab: React.SetStateAction<string>) => {
    setActiveTab(tab);
  };

  const ProductTableData = [
    {
      img: product1,
      project: "Minecraf App",
      name: "Jason Roy",
      progrsss: "73.2%",
      statuscolor: "lightwarning",
      statustextcolor: "text-warning",
      statustext: "Medium",
      money: "$3.5K",
    },
    {
      img: product2,
      project: "Web App Project",
      name: "Mathew Flintoff",
      progrsss: "73.2%",
      statuscolor: "lightsecondary",
      statustextcolor: "text-secondary",
      statustext: "Very High",
      money: "$24.5K",
    },
    {
      img: product3,
      project: "Modernize Dashboard",
      name: "Anil Kumar",
      progrsss: "73.2%",
      statuscolor: "lightsuccess",
      statustextcolor: "text-success",
      statustext: "Low",
      money: "$12.8K",
    },
    {
      img: product4,
      project: "Dashboard Co",
      name: "George Cruize",
      progrsss: "73.2%",
      statuscolor: "lighterror",
      statustextcolor: "text-error",
      statustext: "High",
      money: "$2.4K",
    },
  ];

  const ProductTableData2 = [
    {
      img: product2,
      project: "Web App Project",
      name: "Mathew Flintoff",
      progrsss: "73.2%",
      statuscolor: "lightsecondary",
      statustextcolor: "text-secondary",
      statustext: "Very High",
      money: "$24.5K",
    },
    {
      img: product3,
      project: "Modernize Dashboard",
      name: "Anil Kumar",
      progrsss: "73.2%",
      statuscolor: "lightsuccess",
      statustextcolor: "text-success",
      statustext: "Low",
      money: "$12.8K",
    },
    {
      img: product1,
      project: "Minecraf App",
      name: "Jason Roy",
      progrsss: "73.2%",
      statuscolor: "lightwarning",
      statustextcolor: "text-warning",
      statustext: "Medium",
      money: "$3.5K",
    },

    {
      img: product4,
      project: "Dashboard Co",
      name: "George Cruize",
      progrsss: "73.2%",
      statuscolor: "lighterror",
      statustextcolor: "text-error",
      statustext: "High",
      money: "$2.4K",
    },
  ];

  return (
    <>
      <CardBox className="pb-3">
        <div className="sm:flex justify-between align-baseline">
          <div>
            <h5 className="card-title">Revenue by Product</h5>
          </div>
          <Select required className="form-control select-md w-fit sm:my-0 my-4">
            {dropdownItems.map((items, index) => {
              return <option key={index}>{items}</option>;
            })}
          </Select>
        </div>
        {/* Tabs */}
        <div className="overflow-x-auto">
          <SimpleBar>
            <div className="flex gap-4">
              <div
                onClick={() => handleTabClick("App")}
                className={`py-3 px-6 rounded-tw cursor-pointer text-dark text-sm font-semibold text-center flex gap-2 items-center bg-muted dark:bg-dark hover:bg-lightprimary dark:hover:bg-lightprimary ${
                  activeTab == "App"
                    ? "text-white bg-primary dark:bg-primary hover:bg-primaryemphasis dark:hover:bg-primaryemphasis"
                    : "dark:text-white hover:text-primary dark:hover:text-primary"
                }`}
              >
                <Icon
                  icon="solar:widget-linear"
                  className={`${
                    activeTab == "App" ? "opacity-100" : "opacity-50"
                  }`}
                  height={16}
                />
                App
              </div>
              <div
                onClick={() => handleTabClick("Mobile")}
                className={`py-3 px-6 rounded-tw cursor-pointer text-dark text-sm font-semibold text-center flex gap-2 items-center bg-muted dark:bg-dark hover:bg-lightprimary dark:hover:bg-lightprimary ${
                  activeTab == "Mobile"
                    ? "text-white bg-primary dark:bg-primary hover:bg-primaryemphasis dark:hover:bg-primaryemphasis"
                    : "dark:text-white hover:text-primary dark:hover:text-primary"
                }`}
              >
                <Icon
                  icon="solar:smartphone-line-duotone"
                  className={`${
                    activeTab == "Mobile" ? "opacity-100" : "opacity-50"
                  }`}
                  height={16}
                />{" "}
                Mobile
              </div>
              <div
                onClick={() => handleTabClick("SasS")}
                className={`py-3 px-6 rounded-tw cursor-pointer text-dark text-sm font-semibold text-center flex gap-2 items-center bg-muted dark:bg-dark  hover:bg-lightprimary dark:hover:bg-lightprimary ${
                  activeTab == "SasS"
                    ? "text-white bg-primary dark:bg-primary hover:bg-primaryemphasis dark:hover:bg-primaryemphasis"
                    : "dark:text-white hover:text-primary dark:hover:text-primary"
                }`}
              >
                <Icon
                  icon="solar:calculator-linear"
                  className={`${
                    activeTab == "SasS" ? "opacity-100" : "opacity-50"
                  }`}
                  height={16}
                />{" "}
                SasS
              </div>
              <div
                onClick={() => handleTabClick("Others")}
                className={`py-3 px-6 rounded-tw cursor-pointer text-dark text-sm font-semibold text-center flex gap-2 items-center bg-muted dark:bg-dark hover:bg-lightprimary dark:hover:bg-lightprimary  ${
                  activeTab == "Others"
                    ? "text-white bg-primary dark:bg-primary hover:bg-primaryemphasis dark:hover:bg-primaryemphasis"
                    : "dark:text-white hover:text-primary dark:hover:text-primary"
                }`}
              >
                <Icon
                  icon="solar:folder-open-outline"
                  className={`${
                    activeTab == "Others" ? "opacity-100" : "opacity-50"
                  }`}
                  height={16}
                />{" "}
                Others
              </div>
            </div>
          </SimpleBar>
        </div>

        {/* Tabs Content */}
        {activeTab === "App" && (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHead className="border-b border-bordergray dark:border-darkborder">
                  <TableRow>
                  <TableHeadCell className="py-2 px-3  ps-0 text-ld font-normal">
                    Assigned
                  </TableHeadCell>
                  <TableHeadCell className="text-ld font-normal">
                    Progress
                  </TableHeadCell>
                  <TableHeadCell className="text-ld font-normal">
                    Priority
                  </TableHeadCell>
                  <TableHeadCell className="text-ld font-normal">
                    Budget
                  </TableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody className="divide-y divide-bordergray dark:divide-darkborder ">
                  {ProductTableData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="whitespace-nowrap ps-0">
                        <div className="flex gap-3 items-center">
                          <Image
                            src={item.img}
                            alt="icon"
                            className="h-12 w-12 rounded-tw"
                          />
                          <div className="truncat line-clamp-2 sm:text-wrap max-w-56">
                            <h6 className="text-sm">{item.project}</h6>
                            <p className="">{item.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap ">
                        <p className="text-sm">{item.progrsss}</p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap ">
                        <Badge
                          color={item.statuscolor}
                          className={`${item.statustextcolor}`}
                        >
                          {item.statustext}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap ">
                        <p className="text-ld">{item.money}</p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
        {activeTab === "Mobile" && (
          <div className="overflow-x-auto">
            <Table>
              <TableHead className="border-b border-bordergray dark:border-darkborder">
                <TableRow>
                <TableHeadCell className="py-2 px-3  ps-0 text-ld font-normal">
                  Assigned
                </TableHeadCell>
                <TableHeadCell className="text-ld font-normal">
                  Progress
                </TableHeadCell>
                <TableHeadCell className="text-ld font-normal">
                  Priority
                </TableHeadCell>
                <TableHeadCell className="text-ld font-normal">
                  Budget
                </TableHeadCell>
                </TableRow>
              </TableHead>
              <TableBody className="divide-y divide-bordergray dark:divide-darkborder ">
                {ProductTableData2.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="whitespace-nowrap ps-0">
                      <div className="flex gap-3 items-center">
                        <Image
                          src={item.img}
                          alt="icon"
                          className="h-12 w-12 rounded-tw"
                        />
                        <div className="truncat line-clamp-2 sm:text-wrap max-w-56">
                          <h6 className="text-sm">{item.project}</h6>
                          <p className="">{item.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap ">
                      <p className="text-sm">{item.progrsss}</p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap ">
                      <Badge
                        color={item.statuscolor}
                        className={`${item.statustextcolor}`}
                      >
                        {item.statustext}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap ">
                      <p className="text-ld">{item.money}</p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {activeTab === "SasS" && (
          <div className="overflow-x-auto">
            <Table>
              <TableHead className="border-b border-bordergray dark:border-darkborder">
                <TableHeadCell className="py-2 px-3  ps-0 text-ld font-normal">
                  Assigned
                </TableHeadCell>
                <TableHeadCell className="text-ld font-normal">
                  Progress
                </TableHeadCell>
                <TableHeadCell className="text-ld font-normal">
                  Priority
                </TableHeadCell>
                <TableHeadCell className="text-ld font-normal">
                  Budget
                </TableHeadCell>
              </TableHead>
              <TableBody className="divide-y divide-bordergray dark:divide-darkborder ">
                {ProductTableData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="whitespace-nowrap ps-0">
                      <div className="flex gap-3 items-center">
                        <Image
                          src={item.img}
                          alt="icon"
                          className="h-12 w-12 rounded-tw"
                        />
                        <div className="truncat line-clamp-2 sm:text-wrap max-w-56">
                          <h6 className="text-sm">{item.project}</h6>
                          <p className="">{item.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap ">
                      <p className="text-sm">{item.progrsss}</p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap ">
                      <Badge
                        color={item.statuscolor}
                        className={`${item.statustextcolor}`}
                      >
                        {item.statustext}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap ">
                      <p className="text-ld">{item.money}</p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        {activeTab === "Others" && (
          <div className="overflow-x-auto">
            <Table>
              <TableHead className="border-b border-bordergray dark:border-darkborder">
                <TableHeadCell className="py-2 px-3  ps-0 text-ld font-normal">
                  Assigned
                </TableHeadCell>
                <TableHeadCell className="text-ld font-normal">
                  Progress
                </TableHeadCell>
                <TableHeadCell className="text-ld font-normal">
                  Priority
                </TableHeadCell>
                <TableHeadCell className="text-ld font-normal">
                  Budget
                </TableHeadCell>
              </TableHead>
              <TableBody className="divide-y divide-bordergray dark:divide-darkborder ">
                {ProductTableData2.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="whitespace-nowrap ps-0">
                      <div className="flex gap-3 items-center">
                        <Image
                          src={item.img}
                          alt="icon"
                          className="h-12 w-12 rounded-tw"
                        />
                        <div className="truncat line-clamp-2 sm:text-wrap max-w-56">
                          <h6 className="text-sm">{item.project}</h6>
                          <p className="">{item.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap ">
                      <p className="text-sm">{item.progrsss}</p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap ">
                      <Badge
                        color={item.statuscolor}
                        className={`${item.statustextcolor}`}
                      >
                        {item.statustext}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap ">
                      <p className="text-ld">{item.money}</p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardBox>
    </>
  );
};

export default RevenueByProduct;
