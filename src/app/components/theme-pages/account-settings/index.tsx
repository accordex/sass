"use client";
import React from "react";
import CardBox from "@/app/components/shared/CardBox";
import { TabItem, Tabs } from "flowbite-react";
import {
  IconArticle,
  IconBell,
  IconLock,
  IconUserCircle,
} from "@tabler/icons-react";
import AccountTab from "@/app/components/theme-pages/account-settings/AccountTab";
import NotificationTab from "@/app/components/theme-pages/account-settings/NotificationTab";
import BillsTabs from "@/app/components/theme-pages/account-settings/BillsTab";
import SecurityTab from "@/app/components/theme-pages/account-settings/SecurityTab";

const AccountSettingIndex = () => {
  return (
    <>
      <CardBox className="px-0 py-0 ">
        <Tabs aria-label="Tabs with underline"  variant="underline">
          <TabItem
            active
            title="Account"
            icon={() => <IconUserCircle size={20} />}
          >
            <div className="p-6">
              <AccountTab />
            </div>
          </TabItem>
          <TabItem title="Notification" icon={() => <IconBell size={20} />}>
            <div className="p-6">
              <NotificationTab />
            </div>
          </TabItem>
          <TabItem title="Bills" icon={() => <IconArticle size={20} />}>
            <div className="p-6">
              <BillsTabs />
            </div>
          </TabItem>
          <TabItem title="Security" icon={() => <IconLock size={20} />}>
            <div className="p-6">
              <SecurityTab />
            </div>
          </TabItem>
        </Tabs>
      </CardBox>
    </>
  );
};

export default AccountSettingIndex;
