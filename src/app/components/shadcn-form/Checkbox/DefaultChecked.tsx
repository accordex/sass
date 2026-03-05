"use client";
import React from "react";
import CardBox from "../../shared/CardBox";
import DefaultCheck from "./code/DefaultCheckCode";
import DefaultCheckCode from "./code/DefaultCheckCode.tsx?raw";
import CodeDialog from "../../ui-components/CodeDialog";

const DefaultChecked = () => {
  return (
    <CardBox className="p-0">
      <div>
      <div className="p-6">
        <h4 className="text-lg font-semibold">Default Checked</h4>
        <DefaultCheck/>
      </div>
      <CodeDialog>{DefaultCheckCode}</CodeDialog>
      </div>
      
    </CardBox>
  );
};

export default DefaultChecked;
