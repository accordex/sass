"use client";
import React from "react";
import CardBox from "../../shared/CardBox";
import Basictooltip from "./code/BasicTooltipCode";
import BasicTooltipCode from "./code/BasicTooltipCode.tsx?raw";
import CodeDialog from "../../ui-components/CodeDialog";

const BasicTooltip = () => {
  return (
    <CardBox className="p-0">
      <div>
      <div className="p-6">
        <h4 className="text-lg font-semibold">Basic Tooltip</h4>
        <Basictooltip />
      </div>
      <CodeDialog>{BasicTooltipCode}</CodeDialog>
      </div>
    </CardBox>
  );
};

export default BasicTooltip;
