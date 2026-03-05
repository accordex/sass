"use client";
import React from "react";
import CardBox from "../../shared/CardBox";
import Destrictivetoast from "./code/DesctructiveToastCode";
import DestrictiveToastCode from "./code/DesctructiveToastCode.tsx?raw";
import CodeDialog from "../../ui-components/CodeDialog";

const DestructiveToast = () => {
 
  return (
    <div>
      <CardBox className="p-0">
        <div>
        <div className="p-6">
          <h4 className="text-lg font-semibold">Destructive Toast</h4>
          <Destrictivetoast />
        </div>
        <CodeDialog>{DestrictiveToastCode}</CodeDialog>
        </div>
      </CardBox>
    </div>
  );
};

export default DestructiveToast;
