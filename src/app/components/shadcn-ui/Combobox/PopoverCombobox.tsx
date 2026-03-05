"use client";

import * as React from "react";
import CardBox from "../../shared/CardBox";
import Popovercombo from "./code/PopovercomboCode";
import PopovercomboCode from "./code/PopovercomboCode.tsx?raw";
import CodeDialog from "../../ui-components/CodeDialog";



const PopoverCombobox = () => {
  
  return (
    <CardBox className="p-0">
      <div>
      <div className="p-6">
        <h4 className="text-lg font-semibold">Popover Combobox</h4>
        <Popovercombo/>
      </div>
      <CodeDialog>{PopovercomboCode}</CodeDialog>
      </div>
    </CardBox>
  );
};

export default PopoverCombobox;
