"use client";
import React from "react";
import CardBox from "../../shared/CardBox";
import Actiontoast from "./code/ActionToastCode";
import ActionToastCode from "./code/ActionToastCode.tsx?raw";
import CodeDialog from "../../ui-components/CodeDialog";

const ActionToast = () => {
  
  return (
    <div>
      <CardBox className="p-0">
        <div>
        <div className="p-6">
          <h4 className="text-lg font-semibold">Toast With Action</h4>
          <Actiontoast/>
        </div>
        <CodeDialog>{ActionToastCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  );
};

export default ActionToast;
